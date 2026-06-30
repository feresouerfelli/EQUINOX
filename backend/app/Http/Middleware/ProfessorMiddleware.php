<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Professor;

class ProfessorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'professor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $professor = Professor::where('user_id', $request->user()->id)->first();
        if (!$professor) {
            return response()->json(['message' => 'Professor profile not found'], 404);
        }

        $request->merge(['professor_id' => $professor->id]);

        return $next($request);
    }
}
