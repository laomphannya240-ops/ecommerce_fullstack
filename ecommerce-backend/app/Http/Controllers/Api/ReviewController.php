<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends ApiController
{
    public function index(Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->approved()
            ->with('user')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return $this->paginated($reviews, ReviewResource::class, 'Reviews loaded.');
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->is_active, 404);

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:120'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $existing = Review::withTrashed()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing && ! $existing->trashed()) {
            return $this->error('You have already reviewed this product.', 422);
        }

        $verifiedOrder = $request->user()
            ->orders()
            ->whereIn('status', [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED])
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update([
                ...$validated,
                'order_id' => $verifiedOrder?->id,
                'is_approved' => true,
            ]);

            $review = $existing;
        } else {
            $review = Review::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'order_id' => $verifiedOrder?->id,
                ...$validated,
                'is_approved' => true,
            ]);
        }

        return $this->success(
            new ReviewResource($review->load('user')),
            'Review submitted.',
            201,
        );
    }
}
