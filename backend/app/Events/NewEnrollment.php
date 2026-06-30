<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewEnrollment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $professorId,
        public string $studentName,
        public string $courseName,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('professor.' . $this->professorId);
    }

    public function broadcastAs(): string
    {
        return 'enrollment.new';
    }

    public function broadcastWith(): array
    {
        return [
            'student_name' => $this->studentName,
            'course_name' => $this->courseName,
        ];
    }
}
