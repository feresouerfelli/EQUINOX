<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title_ar',
        'title_fr',
        'title_en',
        'video_url',
        'video_duration_sec',
        'pdf_url',
        'order_index',
        'is_preview',
    ];

    protected $casts = [
        'video_duration_sec' => 'integer',
        'order_index' => 'integer',
        'is_preview' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
