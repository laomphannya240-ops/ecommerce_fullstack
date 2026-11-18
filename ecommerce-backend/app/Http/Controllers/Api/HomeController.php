<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BannerResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class HomeController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $featured = Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['category', 'brand', 'images'])
            ->latest()
            ->limit(8)
            ->get();

        $newArrivals = Product::query()
            ->where('is_active', true)
            ->with(['category', 'brand', 'images'])
            ->latest()
            ->limit(8)
            ->get();

        $bestSellers = Product::query()
            ->where('is_active', true)
            ->with(['category', 'brand', 'images'])
            ->withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->limit(8)
            ->get();

        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('position')
            ->orderBy('sort_order')
            ->get();

        return $this->success([
            'banners' => BannerResource::collection($banners),
            'categories' => CategoryResource::collection($categories),
            'featured_products' => ProductResource::collection($featured),
            'new_arrivals' => ProductResource::collection($newArrivals),
            'best_sellers' => ProductResource::collection($bestSellers),
        ], 'Storefront loaded.');
    }

    public function settings(): JsonResponse
    {
        return $this->success([
            'currency' => config('store.currency', 'USD'),
            'shipping_flat_fee' => (float) config('store.shipping.flat_fee', 0),
            'free_shipping_over' => (float) config('store.shipping.free_over', 0),
            'payment_methods' => config('store.payment_methods', ['cod', 'khqr']),
        ], 'Store settings loaded.');
    }
}
