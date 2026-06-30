<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected SecurityService $security;

    public function __construct(SecurityService $security)
    {
        $this->security = $security;
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password_hash' => Hash::make($validated['password']),
            'role' => 'student',
            'lang' => 'ar',
        ]);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        cache()->put("otp:{$user->phone}", $otp, now()->addMinutes(5));

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful. Please verify your phone.',
        ], 201);
    }

    public function login(Request $request)
    {
        $loginKey = $request->has('email_or_phone') ? 'email_or_phone' : 'email';

        $validated = $request->validate([
            $loginKey => 'required|string',
            'password' => 'required|string',
        ]);

        $credential = $validated[$loginKey];
        $ip = $request->ip();
        $rateKey = "login:{$ip}:{$credential}";

        if (Cache::has("login_lock:{$ip}")) {
            $lockTtl = Cache::get("login_lock:{$ip}");
            return response()->json([
                'error' => 'too_many_attempts',
                'message' => 'Account locked. Try again later.',
                'retry_after' => $lockTtl,
            ], 429);
        }

        $attempts = (int) Cache::get($rateKey, 0);

        if ($attempts >= 5) {
            $lockMinutes = $attempts >= 15 ? 1440 : ($attempts >= 10 ? 5 : 1);
            Cache::put("login_lock:{$ip}", $lockMinutes * 60, now()->addMinutes($lockMinutes));

            $this->security->logEvent(
                'brute_force',
                $ip,
                null,
                '/api/auth/login',
                "Credential: {$credential}, Attempts: {$attempts}",
                $request->userAgent()
            );

            return response()->json([
                'error' => 'too_many_attempts',
                'message' => 'Too many login attempts. Account locked.',
                'retry_after' => $lockMinutes * 60,
            ], 429);
        }

        $user = User::where('email', $credential)
            ->orWhere('phone', $credential)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
            Cache::increment($rateKey);
            Cache::put($rateKey, Cache::get($rateKey), now()->addMinutes(15));

            if ($attempts + 1 >= 3) {
                $this->security->logEvent(
                    'brute_force',
                    $ip,
                    null,
                    '/api/auth/login',
                    "Failed attempt " . ($attempts + 1) . " for: {$credential}",
                    $request->userAgent()
                );
            }

            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Cache::forget($rateKey);

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is banned'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get("otp:{$validated['phone']}");

        if ($cachedOtp !== $validated['otp']) {
            return response()->json(['message' => 'Invalid OTP'], 422);
        }

        $user = User::where('phone', $validated['phone'])->first();
        if ($user) {
            $user->update(['email_verified_at' => now()]);
        }

        cache()->forget("otp:{$validated['phone']}");

        return response()->json(['message' => 'Phone verified successfully']);
    }

    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
        ]);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        cache()->put("otp:{$validated['phone']}", $otp, now()->addMinutes(5));

        return response()->json(['message' => 'OTP resent successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|exists:users,phone',
        ]);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        cache()->put("reset:{$validated['phone']}", $otp, now()->addMinutes(5));

        return response()->json(['message' => 'Reset code sent']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $cachedOtp = cache()->get("reset:{$validated['phone']}");

        if ($cachedOtp !== $validated['otp']) {
            return response()->json(['message' => 'Invalid OTP'], 422);
        }

        $user = User::where('phone', $validated['phone'])->first();
        if ($user) {
            $user->update(['password_hash' => Hash::make($validated['password'])]);
        }

        cache()->forget("reset:{$validated['phone']}");

        return response()->json(['message' => 'Password reset successfully']);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json(['token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
