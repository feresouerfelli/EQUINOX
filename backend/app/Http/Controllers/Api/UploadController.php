<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function thumbnail(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);

        $validated = $request->validate([
            'file' => 'required|file|image:jpeg,png,webp|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('thumbnails', 'public');

        // Delete old thumbnail if exists
        if ($course->thumbnail_url && Storage::disk('public')->exists(str_replace('/storage/', '', $course->thumbnail_url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $course->thumbnail_url));
        }

        $course->update(['thumbnail_url' => '/storage/' . $path]);

        return response()->json([
            'url' => '/storage/' . $path,
            'message' => 'Thumbnail uploaded successfully',
        ]);
    }

    public function video(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        $validated = $request->validate([
            'file' => 'required|file|mimetypes:video/mp4,video/webm,video/quicktime|max:512000',
        ]);

        $file = $request->file('file');
        $path = $file->store('videos', 'public');

        // Delete old video if exists
        if ($lesson->video_url && Storage::disk('public')->exists(str_replace('/storage/', '', $lesson->video_url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $lesson->video_url));
        }

        $lesson->update(['video_url' => '/storage/' . $path]);

        return response()->json([
            'url' => '/storage/' . $path,
            'message' => 'Video uploaded successfully',
        ]);
    }

    public function pdf(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200',
        ]);

        $file = $request->file('file');
        $path = $file->store('pdfs', 'public');

        if ($lesson->pdf_url && Storage::disk('public')->exists(str_replace('/storage/', '', $lesson->pdf_url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $lesson->pdf_url));
        }

        $lesson->update(['pdf_url' => '/storage/' . $path]);

        return response()->json([
            'url' => '/storage/' . $path,
            'message' => 'PDF uploaded successfully',
        ]);
    }

    public function professorFile(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:512000',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $safeName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;

        // Route by extension
        if (in_array(strtolower($extension), ['mp4', 'webm', 'mov'])) {
            $path = $file->storeAs('professor/videos', $safeName, 'public');
        } elseif (strtolower($extension) === 'pdf') {
            $path = $file->storeAs('professor/pdfs', $safeName, 'public');
        } elseif (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'webp'])) {
            $path = $file->storeAs('professor/images', $safeName, 'public');
        } else {
            $path = $file->storeAs('professor/files', $safeName, 'public');
        }

        return response()->json([
            'name' => $originalName,
            'path' => '/storage/' . $path,
            'type' => strtoupper($extension),
            'size' => round($file->getSize() / 1024 / 1024, 2) . ' MB',
            'uploaded_at' => now()->toDateTimeString(),
        ]);
    }

    public function professorFiles(Request $request)
    {
        $directories = ['professor/videos', 'professor/pdfs', 'professor/images', 'professor/files'];
        $files = [];

        foreach ($directories as $dir) {
            if (Storage::disk('public')->exists($dir)) {
                $storageFiles = Storage::disk('public')->files($dir);
                foreach ($storageFiles as $filePath) {
                    $name = basename($filePath);
                    $ext = strtoupper(pathinfo($name, PATHINFO_EXTENSION));
                    $files[] = [
                        'name' => $name,
                        'path' => '/storage/' . $filePath,
                        'type' => $ext,
                        'size' => round(Storage::disk('public')->size($filePath) / 1024 / 1024, 2) . ' MB',
                        'uploaded_at' => Storage::disk('public')->lastModified($filePath),
                    ];
                }
            }
        }

        // Sort by upload time, newest first
        usort($files, fn($a, $b) => $b['uploaded_at'] - $a['uploaded_at']);

        return response()->json($files);
    }
}
