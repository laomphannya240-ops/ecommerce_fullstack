<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends ApiController
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()
            ->visible()
            ->orderBy('sort_order')
            ->get();

        return $this->success(BannerResource::collection($banners), 'Banners loaded.');
    }
}
