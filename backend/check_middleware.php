<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$middleware = $kernel->getMiddleware();
$groupMiddleware = $kernel->getMiddlewareGroups();
echo "=== Global Middleware ===\n";
foreach ($middleware as $key => $value) {
    echo "  $key => " . (is_string($value) ? $value : json_encode($value)) . "\n";
}
echo "\n=== Middleware Groups ===\n";
foreach ($groupMiddleware as $key => $values) {
    echo "  $key:\n";
    foreach ($values as $v) {
        echo "    - $v\n";
    }
}
