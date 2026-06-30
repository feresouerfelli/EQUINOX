<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facades\Pdf;

class NotebookController extends Controller
{
    public function show(Request $request, $courseId)
    {
        $notebook = Notebook::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->first();

        return response()->json([
            'content' => $notebook ? json_decode($notebook->content_json, true) : null,
        ]);
    }

    public function update(Request $request, $courseId)
    {
        $validated = $request->validate([
            'content' => 'required',
        ]);

        Notebook::updateOrCreate(
            ['user_id' => $request->user()->id, 'course_id' => $courseId],
            ['content_json' => json_encode($validated['content'])]
        );

        return response()->json(['message' => 'Notebook saved']);
    }

    public function exportPdf(Request $request, $courseId)
    {
        $notebook = Notebook::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$notebook) {
            return response()->json(['message' => 'No content to export'], 404);
        }

        $content = json_decode($notebook->content_json, true);

        $pdf = Pdf::loadView('pdf.notebook', [
            'content' => $content,
            'user' => $request->user(),
        ]);

        return $pdf->download('notebook-' . $courseId . '.pdf');
    }
}
