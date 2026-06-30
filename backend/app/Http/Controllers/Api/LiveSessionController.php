<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveSession;
use Illuminate\Http\Request;
use LiveKit\Laravel\Facades\LiveKit;
use App\Events\LiveSessionStarted;

class LiveSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = LiveSession::with('professor.user', 'course');

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        $sessions = $query->orderBy('scheduled_at', 'desc')->paginate(20);

        return response()->json($sessions);
    }

    public function join(Request $request, $id)
    {
        $session = LiveSession::findOrFail($id);

        if ($session->status !== 'live' && $session->status !== 'scheduled') {
            return response()->json(['message' => 'Session is not available'], 422);
        }

        $token = LiveKit::acquireToken(
            $request->user()->name,
            $session->livekit_room_name,
            $request->user()->role === 'professor' ? 'moderator' : 'subscriber'
        )->generate();

        return response()->json(['token' => $token]);
    }

    public function start(Request $request, $id)
    {
        $session = LiveSession::with('course', 'professor.user')->findOrFail($id);
        $session->update(['status' => 'live']);

        broadcast(new LiveSessionStarted(
            $session->course_id,
            $session->id,
            $session->course->title ?? $session->course->name,
            $session->professor->user->name
        ))->toOthers();

        return response()->json(['message' => 'Session started']);
    }

    public function end(Request $request, $id)
    {
        $session = LiveSession::findOrFail($id);
        $session->update(['status' => 'ended']);

        return response()->json(['message' => 'Session ended']);
    }
}
