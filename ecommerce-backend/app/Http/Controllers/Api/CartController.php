<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartFor($request);

        return $this->success(new CartResource($cart), 'Cart loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::query()->active()->findOrFail($validated['product_id']);
        $quantity = (int) ($validated['quantity'] ?? 1);
        $cart = $this->cartFor($request);
        $item = $cart->items()->where('product_id', $product->id)->first();
        $newQuantity = $quantity + ($item?->quantity ?? 0);

        if ($newQuantity > $product->stock_quantity) {
            return $this->error(
                $product->stock_quantity === 0
                    ? 'This product is out of stock.'
                    : "Only {$product->stock_quantity} item(s) are available.",
                422,
            );
        }

        if ($item) {
            $item->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }

        return $this->success(new CartResource($this->cartFor($request)), 'Item added to cart.', 201);
    }

    public function update(Request $request, CartItem $item): JsonResponse
    {
        $this->authorizeItem($request, $item);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        if ($validated['quantity'] === 0) {
            $item->delete();

            return $this->success(new CartResource($this->cartFor($request)), 'Item removed from cart.');
        }

        if ($validated['quantity'] > $item->product->stock_quantity) {
            return $this->error("Only {$item->product->stock_quantity} item(s) are available.", 422);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return $this->success(new CartResource($this->cartFor($request)), 'Cart updated.');
    }

    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        $this->authorizeItem($request, $item);
        $item->delete();

        return $this->success(new CartResource($this->cartFor($request)), 'Item removed from cart.');
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cartFor($request)->items()->delete();

        return $this->success(new CartResource($this->cartFor($request)), 'Cart cleared.');
    }

    private function cartFor(Request $request): Cart
    {
        return Cart::query()
            ->firstOrCreate(['user_id' => $request->user()->id])
            ->load([
                'items' => fn ($query) => $query->with([
                    'product' => fn ($query) => $query->with(['category', 'brand'])
                        ->withAvg(['reviews' => fn ($query) => $query->where('is_approved', true)], 'rating'),
                ]),
            ]);
    }

    private function authorizeItem(Request $request, CartItem $item): void
    {
        abort_unless($item->cart->user_id === $request->user()->id, 404);
    }
}
