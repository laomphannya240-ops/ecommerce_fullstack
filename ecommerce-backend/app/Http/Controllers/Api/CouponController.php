<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CouponController extends ApiController
{
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
        ]);

        $cart = $request->user()->cart()->with('items.product')->first();
        $subtotal = $validated['subtotal']
            ?? round($cart?->items->sum(
                fn ($item) => (float) ($item->product?->effective_price ?? 0) * $item->quantity
            ) ?? 0, 2);

        $coupon = Coupon::query()
            ->where('code', Str::upper(trim($validated['code'])))
            ->first();

        if (! $coupon || ! $coupon->isApplicableTo($subtotal)) {
            throw ValidationException::withMessages([
                'code' => ['This coupon is invalid, expired, or does not meet the minimum spend.'],
            ]);
        }

        if ($coupon->per_user_limit !== null) {
            $usageCount = CouponUsage::query()
                ->where('coupon_id', $coupon->id)
                ->where('user_id', $request->user()->id)
                ->count();

            if ($usageCount >= $coupon->per_user_limit) {
                throw ValidationException::withMessages([
                    'code' => ['You have already used this coupon.'],
                ]);
            }
        }

        $discount = $coupon->discountFor($subtotal);

        return $this->success([
            'coupon' => new CouponResource($coupon),
            'subtotal' => (float) $subtotal,
            'discount' => $discount,
            'total' => round(max($subtotal - $discount, 0), 2),
        ], 'Coupon applied.');
    }
}
