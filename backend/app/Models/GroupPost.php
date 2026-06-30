<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'user_id',
        'body',
        'image_url',
        'likes_count',
        'is_pinned',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'is_pinned' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function group()
    {
        return $this->belongsTo(CourseGroup::class, 'group_id');
    }

    public function replies()
    {
        return $this->hasMany(GroupReply::class, 'post_id');
    }
}
