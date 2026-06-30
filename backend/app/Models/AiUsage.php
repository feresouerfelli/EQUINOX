<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'tokens_used',
        'tokens_limit',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'tokens_limit' => 'integer',
    ];
}
