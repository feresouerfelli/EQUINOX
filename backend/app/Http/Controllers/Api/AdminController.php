<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Course;
use App\Models\LiveSession;
use App\Services\SmsService;
use App\Events\BroadcastNotification;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_students' => User::where('role', 'student')->count(),
            'revenue_mtd' => Payment::where('status', 'success')
                ->whereMonth('created_at', now()->month)
                ->sum('amount_dt'),
            'active_subscriptions' => \App\Models\Subscription::where('status', 'active')->count(),
            'live_sessions_today' => LiveSession::whereDate('scheduled_at', today())->count(),
            'new_registrations_today' => User::whereDate('created_at', today())->count(),
        ]);
    }

    public function allCourses(Request $request)
    {
        $query = Course::with('professor.user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title_ar', 'like', "%{$request->search}%")
                  ->orWhere('title_fr', 'like', "%{$request->search}%")
                  ->orWhere('specialty', 'like', "%{$request->search}%");
            });
        }

        $courses = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($courses);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        $users = $query->paginate(20);

        return response()->json($users);
    }

    public function banUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'User unbanned' : 'User banned',
        ]);
    }

    public function addProfessor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'specialty' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => bcrypt(Str::random(12)),
            'role' => 'professor',
            'lang' => 'ar',
        ]);

        \App\Models\Professor::create([
            'user_id' => $user->id,
            'specialty' => $validated['specialty'],
        ]);

        // TODO: Send invitation email

        return response()->json($user, 201);
    }

    public function pendingCourses()
    {
        $courses = Course::where('status', 'pending')
            ->with('professor.user')
            ->get();

        return response()->json($courses);
    }

    public function approveCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->update(['status' => 'active']);

        // TODO: Send approval email to professor

        return response()->json(['message' => 'Course approved']);
    }

    public function payments(Request $request)
    {
        $query = Payment::with('user');

        if ($request->gateway) {
            $query->where('gateway', $request->gateway);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($payments);
    }

    public function broadcast(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'channels' => 'required|array',
            'recipients' => 'required|in:all,group',
            'group_id' => 'nullable|exists:course_groups,id',
        ]);

        $users = User::where('role', 'student')->where('is_active', true);

        if ($validated['recipients'] === 'group' && $validated['group_id']) {
            // Filter users enrolled in the group's course
            // TODO: Implement group-specific broadcasting
        }

        $smsService = app(SmsService::class);
        $sendSms = in_array('sms', $validated['channels']);
        $sendInApp = in_array('inapp', $validated['channels']);
        $sendPush = in_array('push', $validated['channels']);

        $users->chunk(100, function ($chunk) use ($validated, $smsService, $sendSms, $sendInApp, $sendPush) {
            foreach ($chunk as $user) {
                if ($sendInApp) {
                    \App\Models\Notification::create([
                        'user_id' => $user->id,
                        'type' => 'broadcast',
                        'title' => $validated['subject'],
                        'message' => $validated['message'],
                        'channel' => 'inapp',
                    ]);
                }

                if ($sendPush) {
                    broadcast(new BroadcastNotification(
                        $user->id,
                        $validated['subject'],
                        $validated['message']
                    ));
                }

                if ($sendSms && $user->phone) {
                    $smsService->send($user->phone, "EQUINOX: " . $validated['message']);
                }
            }
        });

        return response()->json(['message' => 'Broadcast sent']);
    }
}
