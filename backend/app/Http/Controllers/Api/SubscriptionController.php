<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function current(Request $request)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        return response()->json($subscription);
    }

    public function cancel(Request $request)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if ($subscription) {
            $subscription->update(['status' => 'cancelled']);
        }

        return response()->json(['message' => 'Subscription cancelled']);
    }

    public function upgrade(Request $request)
    {
        // Redirect to payment page
        return response()->json(['message' => 'Redirect to payment']);
    }
}
