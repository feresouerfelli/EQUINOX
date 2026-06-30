<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use App\Models\AiUsage;
use App\Services\FreeApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'message' => 'required|string|max:4000',
            'locale' => 'sometimes|string|in:ar,fr,en',
        ]);

        $user = $request->user();
        $locale = $validated['locale'] ?? $user->lang ?? 'fr';
        $month = now()->format('Y-m');

        // Check AI usage limit
        $usage = AiUsage::firstOrCreate(
            ['user_id' => $user->id, 'month' => $month],
            ['tokens_used' => 0, 'tokens_limit' => 50000]
        );

        if ($usage->tokens_used >= $usage->tokens_limit) {
            return response()->json(['message' => 'AI usage limit reached'], 429);
        }

        // Get chat history
        $chat = AiChat::where('user_id', $user->id)
            ->where('course_id', $validated['course_id'])
            ->first();

        $messages = $chat ? json_decode($chat->messages, true) : [];

        // Fetch enriched context from free APIs
        $enrichedContext = FreeApiService::buildEnrichedContext($validated['message'], $locale);

        // Build the user message with optional context
        $userContent = $validated['message'];
        if (!empty($enrichedContext)) {
            $userContent = $validated['message'] .
                "\n\n---\n[Context from Wikipedia & Reference Sources — use this to enrich your answer, but cite it naturally. Do not mention these brackets to the user.]\n" .
                $enrichedContext;
        }

        $messages[] = ['role' => 'user', 'content' => $userContent];

        // Build Gemini contents from history
        $contents = [];
        foreach (array_slice($messages, -20) as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $msg['content']]],
            ];
        }

        // Call Google Gemini API
        $apiKey = config('services.google.api_key');
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}",
            [
                'systemInstruction' => [
                    'parts' => [['text' => $this->getSystemPrompt($locale)]],
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'maxOutputTokens' => 2048,
                    'temperature' => 0.7,
                ],
            ]
        );

        if ($response->failed()) {
            return response()->json(['message' => 'AI service error'], 500);
        }

        $assistantMessage = $response->json('candidates.0.content.parts.0.text', '');
        // Gemini doesn't return token counts the same way, estimate
        $tokensUsed = intval(mb_strlen($assistantMessage) / 4) + intval(mb_strlen($validated['message']) / 4);

        $messages[] = ['role' => 'assistant', 'content' => $assistantMessage];

        // Save chat (store original message without context for history)
        $messagesForStorage = $messages;
        if (!empty($enrichedContext)) {
            $lastIdx = count($messagesForStorage) - 2;
            $messagesForStorage[$lastIdx]['content'] = $validated['message'];
        }

        if ($chat) {
            $chat->update([
                'messages' => $messagesForStorage,
                'total_tokens_used' => $chat->total_tokens_used + $tokensUsed,
            ]);
        } else {
            AiChat::create([
                'user_id' => $user->id,
                'course_id' => $validated['course_id'],
                'messages' => $messagesForStorage,
                'total_tokens_used' => $tokensUsed,
            ]);
        }

        // Update usage
        $usage->increment('tokens_used', $tokensUsed);

        return response()->json([
            'message' => $assistantMessage,
            'tokens_used' => $tokensUsed,
            'tokens_remaining' => $usage->tokens_limit - $usage->tokens_used,
            'tts_url' => FreeApiService::textToSpeechUrl($assistantMessage, $locale),
        ]);
    }

    public function history(Request $request, $courseId)
    {
        $chat = AiChat::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->first();

        return response()->json([
            'messages' => $chat ? json_decode($chat->messages, true) : [],
        ]);
    }

    /**
     * Generate quiz questions from a topic using Google Gemini.
     */
    public function quiz(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'topic' => 'required|string|max:500',
            'locale' => 'sometimes|string|in:ar,fr,en',
            'count' => 'sometimes|integer|min:1|max:10',
        ]);

        $locale = $validated['locale'] ?? 'fr';
        $count = $validated['count'] ?? 5;

        $langLabel = match($locale) {
            'ar' => 'Tunisian Arabic (الدارجة التونسية)',
            'fr' => 'French',
            'en' => 'English',
            default => 'French',
        };

        $prompt = <<<PROMPT
Generate exactly {$count} multiple-choice quiz questions about: "{$validated['topic']}"
Respond in {$langLabel}.

For each question:
1. Write a clear, simple question
2. Provide 4 options (A, B, C, D)
3. Mark the correct answer
4. Give a 1-sentence explanation of why it's correct

Return ONLY valid JSON (no markdown, no code fences):
{
  "questions": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}
PROMPT;

        $apiKey = config('services.google.api_key');
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}",
            [
                'systemInstruction' => [
                    'parts' => [['text' => 'You are a quiz generator for Tunisian university students. Output ONLY valid JSON, no extra text.']],
                ],
                'contents' => [
                    ['role' => 'user', 'parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 2048,
                    'temperature' => 0.7,
                ],
            ]
        );

        if ($response->failed()) {
            return response()->json(['message' => 'AI service error'], 500);
        }

        $text = $response->json('candidates.0.content.parts.0.text', '');

        // Extract JSON from response
        $json = json_decode($text, true);
        if (!$json) {
            preg_match('/\{[\s\S]*\}/', $text, $matches);
            $json = $matches ? json_decode($matches[0], true) : null;
        }

        if (!$json || empty($json['questions'])) {
            return response()->json(['message' => 'Failed to generate quiz', 'raw' => $text], 500);
        }

        return response()->json([
            'questions' => $json['questions'],
        ]);
    }

    /**
     * Lookup a word in the dictionary.
     */
    public function dictionary(Request $request)
    {
        $validated = $request->validate([
            'word' => 'required|string|max:100',
        ]);

        $result = FreeApiService::dictionaryLookup($validated['word']);

        if (!$result) {
            return response()->json(['message' => 'Word not found'], 404);
        }

        return response()->json(['meanings' => $result]);
    }

    /**
     * Search Wikipedia for related articles.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|max:200',
            'locale' => 'sometimes|string|in:ar,fr,en',
        ]);

        $lang = $validated['locale'] ?? 'fr';
        $wikiLang = $lang === 'ar' ? 'ar' : ($lang === 'fr' ? 'fr' : 'en');

        $results = FreeApiService::wikipediaSearch($validated['query'], $wikiLang, 5);
        $summary = FreeApiService::wikipediaSummary($validated['query'], $wikiLang);

        return response()->json([
            'summary' => $summary,
            'articles' => $results,
        ]);
    }

    private function getSystemPrompt(string $locale = 'fr'): string
    {
        $langInstructions = [
            'ar' => <<<'PROMPT'
You MUST respond entirely in Tunisian Arabic (العربية التونسية الدارجة).
Use simple, everyday Tunisian dialect mixed with standard Arabic — like a friendly tutor explaining to a Tunisian university student.
Examples of good Tunisian Arabic style:
- "هاكلمة باش نفهمو..." instead of "بهدف أن نفهم"
- "ال intégrale هاذي في الحقيقة..." instead of "التكامل في الواقع"
- Use French mathematical terms naturally (dérivée, intégrale, fonction) as Tunisian students do.
- Avoid MSA (فصحى) that sounds like a textbook — sound like you're talking to a friend.
- Use analogies from daily Tunisian life (bazaar, couscous, transport, university cafés).
PROMPT,
            'fr' => <<<'PROMPT'
You MUST respond entirely in French, but use the simplest possible language — imagine explaining to a first-year university student who struggles with the subject.
Rules:
- Use short sentences (max 15 words per sentence).
- Avoid complex subordinate clauses.
- Prefer "tu" over "vous" for a friendly tone.
- Use everyday analogies (cuisine, transport, sport, daily life in Tunisia).
- When you introduce a formula, always explain each symbol right after.
- Structure: definition → simple example → formula → step-by-step walkthrough → common mistakes.
- Use bullet points and numbered lists.
- Never assume the student knows jargon — always define terms first.
PROMPT,
            'en' => <<<'PROMPT'
You MUST respond in English using the simplest possible language — imagine explaining to a student who is learning the concept for the very first time.
Rules:
- Use short, clear sentences.
- Avoid academic jargon unless you define it immediately after.
- Use relatable analogies (cooking, sports, everyday life in Tunisia).
- When showing a formula, explain every single symbol right after.
- Structure your answer: What is it? → Simple example → Formula → Step-by-step → Common mistakes.
- Use bullet points and numbered lists.
- End with a "Check yourself" mini-question to test understanding.
PROMPT,
        ];

        return <<<SYSTEM
You are EQUINOX AI Tutor — a patient, friendly academic assistant for Tunisian university students.

## CORE RULES
1. ALWAYS respond in the language specified below. NEVER switch languages mid-response.
2. Language: {$langInstructions[$locale]}
3. Be warm and encouraging — students are learning, not being tested.
4. Every explanation must follow this structure:
   - **What is it?** (1-2 simple sentences)
   - **Real-life analogy** (something from Tunisian daily life)
   - **How it works** (step-by-step with numbered lists)
   - **Example** (concrete numbers, not abstract variables when possible)
   - **Common mistakes** (what students usually get wrong)
   - **Quick check** (one mini-question to test understanding)
5. For math/science: ALWAYS explain symbols and notation right after showing them.
6. For definitions: Use "X = Y" format, not long paragraphs.
7. Maximum 3 sentences per paragraph.
8. Use emojis sparingly (1-2 per response) to keep tone friendly.
9. If the student asks something unclear, ask ONE clarifying question before answering.
10. Reference Tunisian university curriculum context when relevant (FSM, FST, ENIT, etc.)
11. Never say "I can't help with that" — instead say what you CAN do.
12. When context from Wikipedia or reference sources is provided, use it to give accurate, detailed explanations — but never reveal or reference the source brackets to the user.
SYSTEM;
    }
}
