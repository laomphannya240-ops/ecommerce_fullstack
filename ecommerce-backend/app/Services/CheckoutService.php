<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Create an order from the user's current cart.
     *
     * @param  array<string, mixed>  $data
     */
    public function place(User $user, array $data): Order
    {
        $cart = $user->cart()->with('items')->first();

        if (! $cart || $cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Your cart is empty.',
            ]);
        }

        return DB::transaction(function () use ($cart, $user, $data) {
            $products = Product::query()
                ->whereIn('id', $cart->items->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;

            foreach ($cart->items as $item) {
                $product = $products->get($item->product_id);

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => 'One of the products in your cart is no longer available.',
                    ]);
                }

                if ($item->quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Only {$product->stock_quantity} unit(s) of {$product->name} remain in stock.",
                    ]);
                }

                $subtotal += (float) $product->effective_price * $item->quantity;
            }

            $subtotal = round($subtotal, 2);
            $shippingFee = $subtotal >= (float) config('store.shipping.free_over')
                ? 0.0
                : (float) config('store.shipping.flat_fee');

            $coupon = null;
            $discount = 0.0;

            if (filled($data['coupon_code'] ?? null)) {
                $coupon = Coupon::query()
                    ->where('code', Str::upper(trim($data['coupon_code'])))
                    ->lockForUpdate()
                    ->first();

                if (! $coupon || ! $coupon->isApplicableTo($subtotal)) {
                    throw ValidationException::withMessages([
                        'coupon_code' => 'This coupon is invalid or has expired.',
                    ]);
                }

                if ($coupon->per_user_limit !== null) {
                    $usageCount = CouponUsage::query()
                        ->where('coupon_id', $coupon->id)
                        ->where('user_id', $user->id)
                        ->count();

                    if ($usageCount >= $coupon->per_user_limit) {
                        throw ValidationException::withMessages([
                            'coupon_code' => 'You have already used this coupon.',
                        ]);
                    }
                }

                $discount = $coupon->discountFor($subtotal);
            }

            $total = round(max($subtotal - $discount, 0) + $shippingFee, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $data['address_id'] ?? null,
                'order_number' => $this->generateOrderNumber(),
                'status' => Order::STATUS_PENDING,
                'payment_status' => 'pending',
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'shipping_fee' => $shippingFee,
                'total' => $total,
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'shipping_name' => $data['shipping_name'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_line1' => $data['shipping_line1'],
                'shipping_line2' => $data['shipping_line2'] ?? null,
                'shipping_city' => $data['shipping_city'],
                'shipping_state' => $data['shipping_state'] ?? null,
                'shipping_postal_code' => $data['shipping_postal_code'] ?? null,
                'shipping_country' => $data['shipping_country'] ?? 'Cambodia',
                'notes' => $data['notes'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $product = $products->get($item->product_id);
                $unitPrice = (float) $product->effective_price;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => round($unitPrice * $item->quantity, 2),
                ]);

                $product->decrement('stock_quantity', $item->quantity);
            }

            $paymentMethod = $data['payment_method'];

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'status' => Payment::STATUS_PENDING,
                'amount' => $total,
                'currency' => config('store.currency'),
                'qr_payload' => $paymentMethod === 'khqr'
                    ? json_encode([
                        'demo' => true,
                        'order' => $order->order_number,
                        'amount' => $total,
                        'currency' => config('store.currency'),
                    ])
                    : null,
            ]);

            if ($coupon) {
                $coupon->increment('used_count');

                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $discount,
                    'used_at' => now(),
                ]);
            }

            $cart->items()->delete();

            return $order->load(['items.product', 'payment', 'coupon']);
        });
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'LMN-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (Order::withTrashed()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
