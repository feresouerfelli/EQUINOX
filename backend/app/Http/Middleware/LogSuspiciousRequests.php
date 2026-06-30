<?php

namespace App\Http\Middleware;

use App\Services\SecurityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogSuspiciousRequests
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $path = $request->path();

        if ($this->security->isIpBlocked($ip)) {
            return response()->json([
                'message' => 'Access denied',
            ], 403);
        }

        $this->detectSqlInjection($request, $ip);
        $this->detectPathTraversal($request, $ip);
        $this->detectSuspiciousUserAgent($request, $ip);

        return $next($request);
    }

    protected function detectSqlInjection(Request $request, string $ip): void
    {
        $patterns = [
            '/\b(union\s+select|select\s+.*from|insert\s+into|drop\s+table|delete\s+from)\b/i',
            '/--\s*$|;\s*(drop|delete|update|insert)\b/i',
            "/'\s*(or|and)\s+['\d]/i",
            '/\b(exec|execute|xp_cmdshell|sp_executesql)\b/i',
        ];

        $allInput = json_encode($request->all());

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $allInput)) {
                $this->security->logEvent(
                    'sql_injection',
                    $ip,
                    $request->user()?->id,
                    $request->path(),
                    $allInput,
                    $request->userAgent()
                );
                break;
            }
        }
    }

    protected function detectPathTraversal(Request $request, string $ip): void
    {
        $path = $request->path();
        $query = $request->getQueryString() ?? '';

        if (str_contains($path, '..') || str_contains($query, '..') ||
            preg_match('/\.(env|git|sql|bak|log)$/i', $path)) {
            $this->security->logEvent(
                'path_traversal',
                $ip,
                $request->user()?->id,
                $request->path(),
                $query,
                $request->userAgent()
            );
        }
    }

    protected function detectSuspiciousUserAgent(Request $request, string $ip): void
    {
        $ua = $request->userAgent() ?? '';

        if (empty($ua)) {
            $this->security->logEvent(
                'bot_scan',
                $ip,
                $request->user()?->id,
                $request->path(),
                'Empty user agent',
                $ua
            );
            return;
        }

        $scanners = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'havij', 'acunetix', 'dirbuster', 'gobuster', 'wpscan'];

        foreach ($scanners as $scanner) {
            if (stripos($ua, $scanner) !== false) {
                $this->security->logEvent(
                    'bot_scan',
                    $ip,
                    $request->user()?->id,
                    $request->path(),
                    "Scanner detected: {$scanner}",
                    $ua
                );
                break;
            }
        }
    }
}
