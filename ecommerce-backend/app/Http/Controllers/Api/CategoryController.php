<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->active()
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $this->success(CategoryResource::collection($categories), 'Categories loaded.');
    }

    public function show(Category $category): JsonResponse
    {
        abort_unless($category->is_active, 404);

        $category->loadCount(['products' => fn ($query) => $query->where('is_active', true)]);

        $products = $category->products()
            ->active()
            ->with(['category', 'brand'])
            ->withAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating')
            ->withCount(['reviews' => fn ($query) => $query->where('is_approved', true)])
            ->paginate(12)
            ->withQueryString();

        return $this->success([
            'category' => new CategoryResource($category),
            'products' => ProductResource::collection($products->items()),
        ], 'Category loaded.', 200, [
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
        ]);
    }
}
