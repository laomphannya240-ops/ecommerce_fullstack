<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive,low_stock'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Product::query()
            ->with(['category', 'brand', 'images'])
            ->withCount('orderItems')
            ->search($validated['search'] ?? null);

        $query->when($validated['category'] ?? null, function (Builder $query, string $category) {
            $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
        });

        $query->when($validated['status'] ?? null, function (Builder $query, string $status) {
            match ($status) {
                'active' => $query->where('is_active', true),
                'inactive' => $query->where('is_active', false),
                'low_stock' => $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold'),
            };
        });

        $products = $query->latest()->paginate($validated['per_page'] ?? 15)->withQueryString();

        return $this->paginated($products, ProductResource::class, 'Products loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateProduct($request);

        $product = Product::create([
            ...$this->productAttributes($validated),
            'slug' => $this->uniqueSlug($validated['name']),
            'sku' => $validated['sku'] ?? $this->uniqueSku(),
        ]);

        $this->storeThumbnail($request, $product);
        $this->storeGallery($request, $product);

        return $this->success(
            new ProductResource($product->fresh(['category', 'brand', 'images'])),
            'Product created.',
            201,
        );
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'brand', 'images'])->loadCount('orderItems');

        return $this->success(new ProductResource($product), 'Product loaded.');
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validateProduct($request, $product);

        $product->update($this->productAttributes($validated));

        $this->storeThumbnail($request, $product);
        $this->storeGallery($request, $product);

        if (filled($validated['remove_image_ids'] ?? null)) {
            $images = ProductImage::query()
                ->where('product_id', $product->id)
                ->whereIn('id', $validated['remove_image_ids'])
                ->get();

            foreach ($images as $image) {
                $this->deleteStoredFile($image->image_path);
                $image->delete();
            }
        }

        return $this->success(
            new ProductResource($product->fresh(['category', 'brand', 'images'])),
            'Product updated.',
        );
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->success(null, 'Product deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $required = $product ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'category_id' => [$required, 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => [$required, 'numeric', 'min:0', 'max:9999999'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'max:9999999', 'lte:price'],
            'stock_quantity' => [$required, 'integer', 'min:0', 'max:1000000'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'thumbnail_url' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable', 'array', 'max:6'],
            'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function productAttributes(array $validated): array
    {
        $attributes = collect($validated)
            ->only([
                'category_id',
                'brand_id',
                'name',
                'short_description',
                'description',
                'price',
                'sale_price',
                'stock_quantity',
                'low_stock_threshold',
                'is_active',
                'is_featured',
            ])
            ->all();

        if (filled($validated['sku'] ?? null)) {
            $attributes['sku'] = $validated['sku'];
        }

        if (array_key_exists('is_active', $attributes)) {
            $attributes['is_active'] = (bool) $attributes['is_active'];
        }

        if (array_key_exists('is_featured', $attributes)) {
            $attributes['is_featured'] = (bool) $attributes['is_featured'];
        }

        return $attributes;
    }

    private function storeThumbnail(Request $request, Product $product): void
    {
        if ($request->hasFile('thumbnail')) {
            $this->deleteStoredFile($product->thumbnail);
            $path = $request->file('thumbnail')->store('products', 'public');
            $product->update(['thumbnail' => $path]);

            return;
        }

        if ($request->filled('thumbnail_url')) {
            $product->update(['thumbnail' => $request->string('thumbnail_url')->toString()]);
        }
    }

    private function storeGallery(Request $request, Product $product): void
    {
        if (! $request->hasFile('gallery')) {
            return;
        }

        $startOrder = (int) $product->images()->max('sort_order');

        foreach ($request->file('gallery') as $index => $file) {
            $path = $file->store('products/gallery', 'public');

            $product->images()->create([
                'image_path' => $path,
                'alt_text' => $product->name,
                'sort_order' => $startOrder + $index + 1,
                'is_primary' => false,
            ]);
        }
    }

    private function deleteStoredFile(?string $path): void
    {
        if (filled($path) && ! Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $suffix = 2;

        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function uniqueSku(): string
    {
        do {
            $sku = 'SKU-'.Str::upper(Str::random(8));
        } while (Product::withTrashed()->where('sku', $sku)->exists());

        return $sku;
    }
}
