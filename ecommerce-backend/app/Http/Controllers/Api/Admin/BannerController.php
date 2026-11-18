<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends ApiController
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()->orderBy('sort_order')->latest()->get();

        return $this->success(BannerResource::collection($banners), 'Banners loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateBanner($request);

        $banner = Banner::create([
            ...$validated,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return $this->success(new BannerResource($banner), 'Banner created.', 201);
    }

    public function show(Banner $banner): JsonResponse
    {
        return $this->success(new BannerResource($banner), 'Banner loaded.');
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image_path' => ['sometimes', 'string', 'max:2048'],
            'link_url' => ['nullable', 'string', 'max:2048'],
            'position' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = (bool) $validated['is_active'];
        }

        $banner->update($validated);

        return $this->success(new BannerResource($banner->fresh()), 'Banner updated.');
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return $this->success(null, 'Banner deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateBanner(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image_path' => ['required', 'string', 'max:2048'],
            'link_url' => ['nullable', 'string', 'max:2048'],
            'position' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);
    }
}
