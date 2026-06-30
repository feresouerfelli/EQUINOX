<?php

namespace App\Http\Middleware;

use App\Services\SecurityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBannedUser
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            return response()->json([
                'message' => 'Account has been suspended',
                'error' => 'account_suspended',
            ], 403);
        }

        return $next($request);
    }
}
