<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->items->map(fn ($item) => [
            'id' => $item->id,
            'quantity' => (int) $item->quantity,
            'unit_price' => (float) ($item->product?->effective_price ?? 0),
            'total_price' => round((float) ($item->product?->effective_price ?? 0) * $item->quantity, 2),
            'product' => new ProductResource($item->product),
        ]);

        $subtotal = round($items->sum('total_price'), 2);
        $freeOver = (float) config('store.shipping.free_over');
        $flatFee = (float) config('store.shipping.flat_fee');
        $shippingFee = $subtotal === 0.0 || $subtotal >= $freeOver ? 0.0 : $flatFee;

        return [
            'id' => $this->id,
            'items' => $items->values(),
            'item_count' => (int) $items->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'total' => round($subtotal + $shippingFee, 2),
        ];
    }
}
