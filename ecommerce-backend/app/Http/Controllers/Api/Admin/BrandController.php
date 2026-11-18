<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BrandController extends ApiController
{
    public function index(): JsonResponse
    {
        $brands = Brand::query()
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return $this->success(BrandResource::collection($brands), 'Brands loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:brands,slug'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $brand = Brand::create([
            ...$validated,
            'slug' => $validated['slug'] ?? $this->uniqueSlug($validated['name']),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return $this->success(new BrandResource($brand), 'Brand created.', 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        $brand->loadCount('products');

        return $this->success(new BrandResource($brand), 'Brand loaded.');
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brand->id)],
            'logo' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = (bool) $validated['is_active'];
        }

        $brand->update($validated);

        return $this->success(new BrandResource($brand->fresh()), 'Brand updated.');
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->products()->exists()) {
            return $this->error('Remove this brand from its products before deleting it.', 422);
        }

        $brand->delete();

        return $this->success(null, 'Brand deleted.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'brand';
        $slug = $base;
        $suffix = 2;

        while (Brand::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
