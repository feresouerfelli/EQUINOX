<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveSessionStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $courseId,
        public int $sessionId,
        public string $courseName,
        public string $professorName,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('course.' . $this->courseId);
    }

    public function broadcastAs(): string
    {
        return 'live.started';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'course_name' => $this->courseName,
            'professor_name' => $this->professorName,
        ];
    }
}
