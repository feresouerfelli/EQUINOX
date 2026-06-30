<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupPost;
use App\Models\GroupReply;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function posts(Request $request, $courseId)
    {
        $posts = GroupPost::where('group_id', $courseId)
            ->with('user')
            ->withCount('replies')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($posts);
    }

    public function createPost(Request $request, $courseId)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'image' => 'nullable|file|mimes:jpg,png|max:5120',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $request->file('image')->store('group-posts', 'public');
        }

        $post = GroupPost::create([
            'group_id' => $courseId,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'image_url' => $imageUrl,
        ]);

        return response()->json($post, 201);
    }

    public function reply(Request $request, $courseId, $postId)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $reply = GroupReply::create([
            'post_id' => $postId,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return response()->json($reply, 201);
    }

    public function like(Request $request, $courseId, $postId)
    {
        $post = GroupPost::findOrFail($postId);
        $post->increment('likes_count');

        return response()->json(['likes_count' => $post->likes_count]);
    }
}
