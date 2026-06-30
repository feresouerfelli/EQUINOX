<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiChat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'messages',
        'total_tokens_used',
    ];

    protected $casts = [
        'messages' => 'array',
        'total_tokens_used' => 'integer',
    ];
}
