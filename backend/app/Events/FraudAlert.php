<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FraudAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $adminUserId,
        public string $studentName,
        public string $reason,
        public int $fraudScore,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('admin.fraud');
    }

    public function broadcastAs(): string
    {
        return 'fraud.alert';
    }

    public function broadcastWith(): array
    {
        return [
            'student_name' => $this->studentName,
            'reason' => $this->reason,
            'fraud_score' => $this->fraudScore,
        ];
    }
}
