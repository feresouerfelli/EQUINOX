<?php

namespace App\Services;

use App\Models\BlockedIp;
use App\Models\SecurityLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SecurityService
{
    public function isIpBlocked(string $ip): bool
    {
        $cacheKey = "blocked:{$ip}";

        if (Cache::has($cacheKey)) {
            return true;
        }

        $blocked = BlockedIp::where('ip_address', $ip)
            ->where(function ($query) {
                $query->where('blocked_type', 'permanent')
                    ->orWhere(function ($q) {
                        $q->where('blocked_type', 'temporary')
                          ->where('blocked_until', '>', now());
                    });
            })
            ->first();

        if ($blocked) {
            Cache::put($cacheKey, true, 3600);
            return true;
        }

        return false;
    }

    public function logEvent(
        string $type,
        string $ip,
        ?int $userId,
        string $endpoint,
        ?string $payload = null,
        ?string $userAgent = null,
        bool $blocked = true
    ): void {
        SecurityLog::create([
            'event_type' => $type,
            'ip_address' => $ip,
            'user_id' => $userId,
            'payload' => $payload ? mb_substr($payload, 0, 500) : null,
            'endpoint' => $endpoint,
            'user_agent' => $userAgent,
            'blocked' => $blocked,
        ]);

        $hourCount = SecurityLog::where('ip_address', $ip)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($hourCount >= 20 && !$this->isIpBlocked($ip)) {
            $this->blockIp($ip, $type, 'temporary', 3600);
            Log::warning("[SECURITY] Auto-blocked IP {$ip} after {$hourCount} events in 1 hour");
        }
    }

    public function blockIp(
        string $ip,
        string $reason,
        string $type = 'permanent',
        ?int $durationSeconds = null
    ): void {
        $data = [
            'reason' => $reason,
            'blocked_type' => $type,
            'attempt_count' => DB::raw('attempt_count + 1'),
        ];

        if ($type === 'temporary' && $durationSeconds) {
            $data['blocked_until'] = now()->addSeconds($durationSeconds);
        }

        BlockedIp::updateOrCreate(
            ['ip_address' => $ip],
            $data
        );

        Cache::put("blocked:{$ip}", true, $durationSeconds ?? 86400);
    }

    public function unblockIp(string $ip): void
    {
        BlockedIp::where('ip_address', $ip)->delete();
        Cache::forget("blocked:{$ip}");
    }

    public function getStats(): array
    {
        $today = now()->startOfDay();

        return [
            'total_attacks' => SecurityLog::count(),
            'today_attacks' => SecurityLog::where('created_at', '>=', $today)->count(),
            'blocked_ips' => BlockedIp::count(),
            'pending_review' => SecurityLog::where('event_type', 'fraud')
                ->where('blocked', true)->count(),
            'healthy_requests' => SecurityLog::where('created_at', '>=', $today->copy()->subHour())
                ->where('blocked', false)->count(),
        ];
    }

    public function getAttackBreakdown(): array
    {
        $today = now()->startOfDay();

        return SecurityLog::where('created_at', '>=', $today)
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type')
            ->toArray();
    }
}
