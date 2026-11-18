<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CouponController extends ApiController
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::query()->latest()->get();

        return $this->success(CouponResource::collection($coupons), 'Coupons loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateCoupon($request);

        $coupon = Coupon::create([
            ...$validated,
            'code' => Str::upper($validated['code']),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return $this->success(new CouponResource($coupon), 'Coupon created.', 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return $this->success(new CouponResource($coupon), 'Coupon loaded.');
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'type' => ['sometimes', 'in:fixed,percent'],
            'value' => ['sometimes', 'numeric', 'min:0', 'max:9999999'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('code', $validated)) {
            $validated['code'] = Str::upper($validated['code']);
        }

        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = (bool) $validated['is_active'];
        }

        $coupon->update($validated);

        return $this->success(new CouponResource($coupon->fresh()), 'Coupon updated.');
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return $this->success(null, 'Coupon deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateCoupon(Request $request): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'in:fixed,percent'],
            'value' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
