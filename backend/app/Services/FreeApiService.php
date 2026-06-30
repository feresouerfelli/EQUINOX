<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FreeApiService
{
    /**
     * Search Wikipedia for academic context (free, no API key needed).
     */
    public static function wikipediaSummary(string $query, string $lang = 'en'): ?string
    {
        $cacheKey = "wiki_" . md5($query . $lang);

        return Cache::remember($cacheKey, 3600, function () use ($query, $lang) {
            try {
                $searchUrl = "https://{$lang}.wikipedia.org/api/rest_v1/page/summary/" . rawurlencode($query);
                $response = Http::timeout(5)->get($searchUrl);

                if ($response->successful()) {
                    $data = $response->json();
                    return $data['extract'] ?? null;
                }
                return null;
            } catch (\Exception $e) {
                return null;
            }
        });
    }

    /**
     * Search Wikipedia for related articles (free).
     */
    public static function wikipediaSearch(string $query, string $lang = 'en', int $limit = 3): array
    {
        $cacheKey = "wiki_search_" . md5($query . $lang);

        return Cache::remember($cacheKey, 3600, function () use ($query, $lang, $limit) {
            try {
                $url = "https://{$lang}.wikipedia.org/w/api.php?" . http_build_query([
                    'action' => 'query',
                    'list' => 'search',
                    'srsearch' => $query,
                    'srlimit' => $limit,
                    'format' => 'json',
                ]);

                $response = Http::timeout(5)->get($url);

                if ($response->successful()) {
                    $results = $response->json('query.search', []);
                    return array_map(fn($r) => [
                        'title' => $r['title'],
                        'snippet' => strip_tags($r['snippet']),
                    ], $results);
                }
                return [];
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    /**
     Free dictionary lookup (free, no API key).
     */
    public static function dictionaryLookup(string $word): ?array
    {
        $cacheKey = "dict_" . md5($word);

        return Cache::remember($cacheKey, 86400, function () use ($word) {
            try {
                $response = Http::timeout(5)->get("https://api.dictionaryapi.dev/api/v2/entries/en/" . rawurlencode($word));

                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data[0]['meanings'])) {
                        $meanings = [];
                        foreach ($data[0]['meanings'] as $meaning) {
                            $meanings[] = [
                                'partOfSpeech' => $meaning['partOfSpeech'],
                                'definition' => $meaning['definitions'][0]['definition'] ?? '',
                                'example' => $meaning['definitions'][0]['example'] ?? '',
                            ];
                        }
                        return $meanings;
                    }
                }
                return null;
            } catch (\Exception $e) {
                return null;
            }
        });
    }

    /**
     * DuckDuckGo instant answer search (free, no API key).
     */
    public static function searchInstant(string $query): ?string
    {
        $cacheKey = "ddg_" . md5($query);

        return Cache::remember($cacheKey, 1800, function () use ($query) {
            try {
                $response = Http::timeout(5)->get("https://api.duckduckgo.com/?" . http_build_query([
                    'q' => $query,
                    'format' => 'json',
                    'no_html' => 1,
                    'skip_disambig' => 1,
                ]));

                if ($response->successful()) {
                    $data = $response->json();
                    $abstract = $data['AbstractText'] ?? '';
                    if (!empty($abstract)) {
                        return $abstract;
                    }
                    // Try related topics
                    if (!empty($data['RelatedTopics'])) {
                        $topics = array_slice($data['RelatedTopics'], 0, 2);
                        return implode("\n", array_map(
                            fn($t) => $t['Text'] ?? '',
                            array_filter($topics, fn($t) => isset($t['Text']))
                        ));
                    }
                }
                return null;
            } catch (\Exception $e) {
                return null;
            }
        });
    }

    /**
     * Google Free TTS - returns audio URL for text.
     */
    public static function textToSpeechUrl(string $text, string $lang = 'fr'): string
    {
        $encoded = rawurlencode(mb_strcut($text, 0, 200));
        $langCode = match($lang) {
            'ar' => 'ar',
            'fr' => 'fr',
            'en' => 'en',
            default => 'fr',
        };
        // Google Translate TTS (free, no key)
        return "https://translate.google.com/translate_tts?ie=UTF-8&q={$encoded}&tl={$langCode}&client=tw-ob";
    }

    /**
     * Build enriched context from free APIs for Claude.
     */
    public static function buildEnrichedContext(string $userMessage, string $locale): string
    {
        $context = [];

        // Extract key terms from the user message
        $words = preg_split('/\s+/', $userMessage, -1, PREG_SPLIT_NO_EMPTY);
        $queryTerms = implode(' ', array_slice($words, 0, 6));

        // 1. Wikipedia context
        $wikiSummary = self::wikipediaSummary($queryTerms, $locale === 'ar' ? 'ar' : ($locale === 'fr' ? 'fr' : 'en'));
        if ($wikiSummary) {
            $context[] = "[Wikipedia Reference]: " . mb_strcut($wikiSummary, 0, 500);
        }

        // 2. Wikipedia search for related concepts
        $wikiResults = self::wikipediaSearch($queryTerms, $locale === 'ar' ? 'ar' : ($locale === 'fr' ? 'fr' : 'en'), 2);
        if (!empty($wikiResults)) {
            foreach ($wikiResults as $result) {
                $context[] = "[Related: {$result['title']}]: {$result['snippet']}";
            }
        }

        // 3. DuckDuckGo instant answer
        $ddgResult = self::searchInstant($queryTerms);
        if ($ddgResult) {
            $context[] = "[Reference]: " . mb_strcut($ddgResult, 0, 500);
        }

        return !empty($context) ? implode("\n\n", $context) : '';
    }
}
