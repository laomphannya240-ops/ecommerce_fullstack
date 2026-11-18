<?php

namespace App\Services;

use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Cancel an order and return its reserved stock to inventory.
     */
    public function cancel(Order $order): Order
    {
        if (! $order->canBeCancelled()) {
            throw ValidationException::withMessages([
                'order' => 'This order can no longer be cancelled.',
            ]);
        }

        return DB::transaction(function () use ($order) {
            $order->loadMissing('items', 'payment');

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $item->product?->increment('stock_quantity', $item->quantity);
                }
            }

            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'payment_status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            $order->payment?->update([
                'status' => Payment::STATUS_CANCELLED,
                'failed_at' => now(),
            ]);

            if ($order->coupon_id) {
                $order->coupon?->decrement('used_count');
                CouponUsage::query()->where('order_id', $order->id)->delete();
            }

            return $order->fresh(['items.product', 'payment']);
        });
    }
}
