<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $price = (float) $this->price;
        $salePrice = $this->sale_price !== null ? (float) $this->sale_price : null;
        $effectivePrice = $salePrice ?? $price;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $price,
            'sale_price' => $salePrice,
            'effective_price' => $effectivePrice,
            'discount_percent' => $salePrice !== null && $price > 0
                ? (int) round((($price - $salePrice) / $price) * 100)
                : 0,
            'stock_quantity' => (int) $this->stock_quantity,
            'in_stock' => $this->inStock(),
            'low_stock' => $this->stock_quantity > 0 && $this->stock_quantity <= $this->low_stock_threshold,
            'thumbnail' => $this->thumbnail,
            'thumbnail_url' => $this->thumbnail_url,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'rating' => $this->when(isset($this->reviews_avg_rating), fn () => round((float) $this->reviews_avg_rating, 1)),
            'reviews_count' => $this->when(isset($this->reviews_count), fn () => (int) $this->reviews_count),
            'orders_count' => $this->when(isset($this->order_items_count), fn () => (int) $this->order_items_count),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
