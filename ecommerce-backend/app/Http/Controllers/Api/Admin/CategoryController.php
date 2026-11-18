<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->success(CategoryResource::collection($categories), 'Categories loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $category = Category::create([
            ...$validated,
            'slug' => $validated['slug'] ?? $this->uniqueSlug($validated['name']),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return $this->success(new CategoryResource($category), 'Category created.', 201);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');

        return $this->success(new CategoryResource($category), 'Category loaded.');
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id', 'not_in:'.$category->id],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = (bool) $validated['is_active'];
        }

        $category->update($validated);

        return $this->success(new CategoryResource($category->fresh()), 'Category updated.');
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return $this->error('Move or delete this category\'s products before deleting it.', 422);
        }

        $category->delete();

        return $this->success(null, 'Category deleted.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $suffix = 2;

        while (Category::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
