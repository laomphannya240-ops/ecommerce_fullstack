<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends ApiController
{
    public function index(): JsonResponse
    {
        $brands = Brand::query()
            ->active()
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('name')
            ->get();

        return $this->success(BrandResource::collection($brands), 'Brands loaded.');
    }
}
