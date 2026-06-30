<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'professor_id',
        'title_ar',
        'title_fr',
        'title_en',
        'description_ar',
        'description_fr',
        'description_en',
        'thumbnail_url',
        'specialty',
        'level',
        'price_dt',
        'is_free',
        'status',
        'total_lessons',
        'total_duration_min',
    ];

    protected $casts = [
        'price_dt' => 'decimal:2',
        'is_free' => 'boolean',
        'total_lessons' => 'integer',
        'total_duration_min' => 'integer',
    ];

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
