<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'professor' => \App\Http\Middleware\ProfessorMiddleware::class,
            'sanitize' => \App\Http\Middleware\SanitizeInputMiddleware::class,
            'security.headers' => \App\Http\Middleware\SecurityHeadersMiddleware::class,
            'log.suspicious' => \App\Http\Middleware\LogSuspiciousRequests::class,
            'check.banned' => \App\Http\Middleware\CheckBannedUser::class,
            'verify.origin' => \App\Http\Middleware\VerifyOriginMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
