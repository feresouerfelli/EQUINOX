<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\SecurityLog;
use App\Services\SecurityService;
use Illuminate\Http\Request;

class AdminSecurityController extends Controller
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function stats()
    {
        return response()->json([
            'stats' => $this->security->getStats(),
            'breakdown' => $this->security->getAttackBreakdown(),
        ]);
    }

    public function logs(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 50);
        $type = $request->get('type');

        $query = SecurityLog::orderByDesc('created_at');

        if ($type) {
            $query->where('event_type', $type);
        }

        $logs = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json($logs);
    }

    public function blockedIps()
    {
        $ips = BlockedIp::orderByDesc('created_at')->get();

        return response()->json($ips);
    }

    public function blockIp(Request $request)
    {
        $validated = $request->validate([
            'ip_address' => 'required|string|max:45',
            'reason' => 'required|string|max:50',
            'blocked_type' => 'required|in:permanent,temporary',
            'duration' => 'nullable|integer|min:300',
        ]);

        $this->security->blockIp(
            $validated['ip_address'],
            $validated['reason'],
            $validated['blocked_type'],
            $validated['duration'] ?? null
        );

        return response()->json(['message' => 'IP blocked successfully']);
    }

    public function unblockIp(string $ip)
    {
        $this->security->unblockIp($ip);

        return response()->json(['message' => 'IP unblocked successfully']);
    }
}
