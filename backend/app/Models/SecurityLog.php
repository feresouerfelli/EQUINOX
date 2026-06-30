<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    protected $table = 'security_log';
    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'ip_address',
        'user_id',
        'payload',
        'endpoint',
        'user_agent',
        'blocked',
    ];

    protected $casts = [
        'blocked' => 'boolean',
        'created_at' => 'datetime',
    ];
}
