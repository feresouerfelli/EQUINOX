<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_code_id',
        'submitted_code',
        'code_match',
        'plan',
        'amount_dt',
        'gateway',
        'screenshot_path',
        'screenshot_hash',
        'image_width',
        'image_height',
        'image_exif_date',
        'has_exif',
        'fraud_score',
        'fraud_flags',
        'ticket_number',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount_dt' => 'decimal:2',
        'code_match' => 'boolean',
        'has_exif' => 'boolean',
        'fraud_flags' => 'array',
        'image_exif_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentCode()
    {
        return $this->belongsTo(PaymentCode::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
