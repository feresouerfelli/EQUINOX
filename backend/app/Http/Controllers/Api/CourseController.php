<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Events\NewEnrollment;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::where('status', 'active')
            ->with('professor.user');

        if ($request->specialty) {
            $query->where('specialty', $request->specialty);
        }
        if ($request->level) {
            $query->where('level', $request->level);
        }
        if ($request->has('free')) {
            $query->where('is_free', $request->boolean('free'));
        }

        $courses = $query->paginate(12);

        return response()->json($courses);
    }

    public function show($id)
    {
        $course = Course::with('professor.user', 'lessons')
            ->findOrFail($id);

        return response()->json($course);
    }

    public function lessons($id)
    {
        $course = Course::findOrFail($id);
        $lessons = $course->lessons()->orderBy('order_index')->get();

        return response()->json($lessons);
    }

    public function enroll(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $existing = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $validated['course_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already enrolled'], 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $validated['course_id'],
            'progress_percent' => 0,
        ]);

        // Broadcast new enrollment to professor
        $course = Course::with('professor')->find($validated['course_id']);
        if ($course && $course->professor) {
            broadcast(new NewEnrollment(
                $course->professor_id,
                $request->user()->name,
                $course->title ?? $course->name
            ))->toOthers();
        }

        return response()->json($enrollment, 201);
    }

    public function studentCourses(Request $request)
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with('course.professor.user')
            ->get();

        return response()->json($enrollments);
    }

    public function updateProgress(Request $request, $id)
    {
        $validated = $request->validate([
            'watched_seconds' => 'required|integer|min:0',
            'is_completed' => 'boolean',
        ]);

        $progress = LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $id],
            [
                'watched_seconds' => $validated['watched_seconds'],
                'is_completed' => $validated['is_completed'] ?? false,
                'last_watched_at' => now(),
            ]
        );

        return response()->json($progress);
    }
}
