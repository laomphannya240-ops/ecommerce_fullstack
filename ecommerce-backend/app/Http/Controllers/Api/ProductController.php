<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'featured' => ['nullable', 'boolean'],
            'in_stock' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:latest,oldest,price_asc,price_desc,name_asc,popular'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $query = Product::query()
            ->active()
            ->with(['category', 'brand'])
            ->withAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating')
            ->withCount(['reviews' => fn ($query) => $query->where('is_approved', true)])
            ->search($validated['search'] ?? null);

        $query->when($validated['category'] ?? null, function (Builder $query, string $category) {
            $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
        });

        $query->when($validated['brand'] ?? null, function (Builder $query, string $brand) {
            $query->whereHas('brand', fn (Builder $query) => $query->where('slug', $brand));
        });

        $query->when($validated['min_price'] ?? null, fn (Builder $query, $min) => $query->whereRaw('COALESCE(sale_price, price) >= ?', [$min]));
        $query->when($validated['max_price'] ?? null, fn (Builder $query, $max) => $query->whereRaw('COALESCE(sale_price, price) <= ?', [$max]));

        $query->when($request->boolean('featured'), fn (Builder $query) => $query->featured());
        $query->when($request->boolean('in_stock'), fn (Builder $query) => $query->where('stock_quantity', '>', 0));

        match ($validated['sort'] ?? 'latest') {
            'oldest' => $query->oldest(),
            'price_asc' => $query->orderByRaw('COALESCE(sale_price, price) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(sale_price, price) DESC'),
            'name_asc' => $query->orderBy('name'),
            'popular' => $query->withCount('orderItems')->orderByDesc('order_items_count'),
            default => $query->latest(),
        };

        $products = $query->paginate($validated['per_page'] ?? 12)->withQueryString();

        return $this->paginated($products, ProductResource::class, 'Products loaded.');
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->is_active, 404);

        $product->load([
            'category',
            'brand',
            'images',
            'reviews' => fn ($query) => $query->approved()->with('user')->latest()->limit(6),
        ])->loadAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating')
            ->loadCount(['reviews' => fn ($query) => $query->where('is_approved', true)]);

        $related = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->getKey())
            ->with(['category', 'brand'])
            ->withAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating')
            ->withCount(['reviews' => fn ($query) => $query->where('is_approved', true)])
            ->limit(4)
            ->get();

        $user = $request->user();
        $isWishlisted = false;

        if ($user) {
            $isWishlisted = $user->wishlist()
                ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
                ->exists();
        }

        return $this->success([
            'product' => new ProductResource($product),
            'related' => ProductResource::collection($related),
            'reviews' => ReviewResource::collection($product->reviews),
            'review_summary' => [
                'average' => round((float) ($product->reviews_avg_rating ?? 0), 1),
                'count' => (int) $product->reviews_count,
                'distribution' => $product->reviews()
                    ->approved()
                    ->selectRaw('rating, COUNT(*) as total')
                    ->groupBy('rating')
                    ->pluck('total', 'rating'),
            ],
            'is_wishlisted' => $isWishlisted,
        ], 'Product loaded.');
    }
}
