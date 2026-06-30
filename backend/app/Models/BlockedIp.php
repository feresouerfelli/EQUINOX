<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedIp extends Model
{
    protected $table = 'blocked_ips';
    public $timestamps = false;

    protected $fillable = [
        'ip_address',
        'reason',
        'blocked_type',
        'blocked_until',
        'blocked_by',
        'attempt_count',
    ];

    protected $casts = [
        'blocked_until' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function isCurrentlyBlocked(): bool
    {
        if ($this->blocked_type === 'permanent') {
            return true;
        }

        return $this->blocked_until && $this->blocked_until->isFuture();
    }
}
