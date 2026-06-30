<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveSession;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Events\LiveSessionStarted;
use App\Events\NewEnrollment;
use Illuminate\Http\Request;

class ProfessorController extends Controller
{
    public function courses(Request $request)
    {
        $professorId = $request->professor_id;

        $courses = Course::where('professor_id', $professorId)
            ->withCount('enrollments')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($courses);
    }

    public function stats(Request $request)
    {
        $professorId = $request->professor_id;

        $courseIds = Course::where('professor_id', $professorId)->pluck('id');
        $enrollments = Enrollment::whereIn('course_id', $courseIds)->get();

        $totalStudents = $enrollments->pluck('user_id')->unique()->count();
        $totalCourses = Course::where('professor_id', $professorId)->count();
        $activeCourses = Course::where('professor_id', $professorId)->where('status', 'active')->count();

        $revenue = Payment::whereIn('user_id', $enrollments->pluck('user_id'))
            ->where('status', 'success')
            ->sum('amount_dt');

        $upcomingSessions = LiveSession::where('professor_id', $professorId)
            ->where('scheduled_at', '>=', now())
            ->where('status', 'scheduled')
            ->count();

        $todaySessions = LiveSession::where('professor_id', $professorId)
            ->whereDate('scheduled_at', today())
            ->count();

        $avgProgress = Enrollment::whereIn('course_id', $courseIds)
            ->avg('progress_percent') ?? 0;

        return response()->json([
            'total_students' => $totalStudents,
            'total_courses' => $totalCourses,
            'active_courses' => $activeCourses,
            'revenue' => $revenue,
            'upcoming_sessions' => $upcomingSessions,
            'today_sessions' => $todaySessions,
            'avg_progress' => round($avgProgress),
        ]);
    }

    public function students(Request $request)
    {
        $professorId = $request->professor_id;

        $courseIds = Course::where('professor_id', $professorId)->pluck('id');

        $students = Enrollment::whereIn('course_id', $courseIds)
            ->with(['user', 'course'])
            ->orderBy('enrolled_at', 'desc')
            ->paginate(50);

        return response()->json($students);
    }

    public function liveSessions(Request $request)
    {
        $professorId = $request->professor_id;

        $sessions = LiveSession::where('professor_id', $professorId)
            ->with('course')
            ->orderBy('scheduled_at', 'desc')
            ->paginate(20);

        return response()->json($sessions);
    }

    public function createLiveSession(Request $request)
    {
        $professorId = $request->professor_id;

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'duration_min' => 'required|integer|min:15|max:180',
        ]);

        $course = Course::where('id', $validated['course_id'])
            ->where('professor_id', $professorId)
            ->first();

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $session = LiveSession::create([
            'professor_id' => $professorId,
            'course_id' => $validated['course_id'],
            'title' => $validated['title'],
            'scheduled_at' => $validated['scheduled_at'],
            'duration_min' => $validated['duration_min'],
            'livekit_room_name' => 'room-' . uniqid(),
            'status' => 'scheduled',
        ]);

        // Broadcast to enrolled students
        broadcast(new LiveSessionStarted(
            $validated['course_id'],
            $session->id,
            $course->title ?? $course->name,
            $request->user()->name
        ))->toOthers();

        return response()->json($session, 201);
    }

    public function analytics(Request $request)
    {
        $professorId = $request->professor_id;

        $courseIds = Course::where('professor_id', $professorId)->pluck('id');

        $courses = Course::where('professor_id', $professorId)
            ->withCount('enrollments')
            ->get()
            ->map(fn ($c) => [
                'name' => $c->title_ar,
                'students' => $c->enrollments_count,
                'rating' => (float) $c->rating ?? 0,
                'level' => $c->level,
                'specialty' => $c->specialty,
            ]);

        $enrollments = Enrollment::whereIn('course_id', $courseIds)->get();
        $avgCompletion = $enrollments->avg('progress_percent') ?? 0;

        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->translatedFormat('M');
            $amount = Payment::whereIn('user_id', $enrollments->pluck('user_id'))
                ->where('status', 'success')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount_dt');
            $monthlyRevenue[] = ['month' => $monthName, 'amount' => (float) $amount];
        }

        $totalStudents = Enrollment::whereIn('course_id', $courseIds)->distinct('user_id')->count('user_id');
        $totalRevenue = Payment::whereIn('user_id', $enrollments->pluck('user_id'))->where('status', 'success')->sum('amount_dt');
        $activeCourses = Course::where('professor_id', $professorId)->where('status', 'active')->count();

        return response()->json([
            'kpis' => [
                'total_revenue' => (float) $totalRevenue,
                'total_students' => $totalStudents,
                'avg_completion' => round($avgCompletion),
                'active_courses' => $activeCourses,
            ],
            'courses' => $courses,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    public function profile(Request $request)
    {
        $professorId = $request->professor_id;
        $user = $request->user();
        $professor = \App\Models\Professor::find($professorId);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'professor' => $professor ? [
                'bio_ar' => $professor->bio_ar,
                'bio_fr' => $professor->bio_fr,
                'bio_en' => $professor->bio_en,
                'specialty' => $professor->specialty,
            ] : null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $professorId = $request->professor_id;
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio_ar' => 'sometimes|string|max:2000',
            'bio_fr' => 'sometimes|string|max:2000',
            'bio_en' => 'sometimes|string|max:2000',
            'specialty' => 'sometimes|string|max:255',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        $professor = \App\Models\Professor::findOrFail($professorId);
        $professor->update(collect($validated)->except('name')->toArray());

        return response()->json(['message' => 'Profile updated']);
    }
}
