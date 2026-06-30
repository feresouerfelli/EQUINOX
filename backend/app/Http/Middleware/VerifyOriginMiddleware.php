<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyOriginMiddleware
{
    private array $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $origin = $request->header('Origin');
            $referer = $request->header('Referer');

            if ($origin && !in_array($origin, $this->allowedOrigins)) {
                return response()->json(['message' => 'Origin not allowed'], 403);
            }

            if ($referer) {
                $refererHost = parse_url($referer, PHP_URL_HOST);
                $allowedHosts = array_map(function ($url) {
                    return parse_url($url, PHP_URL_HOST);
                }, $this->allowedOrigins);

                if ($refererHost && !in_array($refererHost, $allowedHosts)) {
                    return response()->json(['message' => 'Referer not allowed'], 403);
                }
            }
        }

        return $next($request);
    }
}
