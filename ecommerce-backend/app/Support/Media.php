<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media
{
    /**
     * Resolve a stored media path or external URL into an absolute URL.
     */
    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', 'data:'])) {
            return $path;
        }

        if (Str::startsWith($path, '/storage/')) {
            return url($path);
        }

        if (Str::startsWith($path, 'storage/')) {
            return url($path);
        }

        return Storage::disk('public')->url($path);
    }
}
