<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\WishlistItemResource;
use App\Models\Product;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        return $this->success(
            WishlistItemResource::collection($this->wishlistFor($request)->items),
            'Wishlist loaded.',
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        Product::query()->active()->findOrFail($validated['product_id']);

        $wishlist = Wishlist::query()->firstOrCreate(['user_id' => $request->user()->id]);
        $item = WishlistItem::query()->firstOrCreate([
            'wishlist_id' => $wishlist->id,
            'product_id' => $validated['product_id'],
        ]);

        return $this->success(
            new WishlistItemResource($item->load('product.category', 'product.brand')),
            $item->wasRecentlyCreated ? 'Added to wishlist.' : 'Already in your wishlist.',
            201,
        );
    }

    public function destroy(Request $request, WishlistItem $item): JsonResponse
    {
        abort_unless($item->wishlist->user_id === $request->user()->id, 404);

        $item->delete();

        return $this->success(null, 'Removed from wishlist.');
    }

    private function wishlistFor(Request $request): Wishlist
    {
        return Wishlist::query()
            ->firstOrCreate(['user_id' => $request->user()->id])
            ->load([
                'items' => fn ($query) => $query->with([
                    'product' => fn ($query) => $query->with(['category', 'brand'])
                        ->withAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating'),
                ]),
            ]);
    }
}
