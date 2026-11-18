<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $unitPrice = (float) ($this->product?->effective_price ?? 0);

        return [
            'id' => $this->id,
            'quantity' => (int) $this->quantity,
            'unit_price' => $unitPrice,
            'total_price' => round($unitPrice * $this->quantity, 2),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
