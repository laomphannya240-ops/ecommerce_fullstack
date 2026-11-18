<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(Order::statuses())],
            'payment_status' => ['nullable', 'in:pending,paid,failed,cancelled,refunded'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $orders = Order::query()
            ->with(['user', 'payment'])
            ->withCount('items')
            ->when($validated['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('order_number', 'like', "%{$search}%")
                        ->orWhere('shipping_name', 'like', "%{$search}%")
                        ->orWhere('shipping_phone', 'like', "%{$search}%")
                        ->orWhereHas('user', fn (Builder $query) => $query->where('email', 'like', "%{$search}%"));
                });
            })
            ->when($validated['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($validated['payment_status'] ?? null, fn (Builder $query, string $status) => $query->where('payment_status', $status))
            ->latest('placed_at')
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->paginated($orders, OrderResource::class, 'Orders loaded.');
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'items.product.category', 'items.product.brand', 'payment', 'coupon']);

        return $this->success(new OrderResource($order), 'Order loaded.');
    }

    public function updateStatus(Request $request, Order $order, OrderService $orderService): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::statuses())],
            'payment_status' => ['nullable', 'in:pending,paid,failed,cancelled,refunded'],
        ]);

        if ($validated['status'] === Order::STATUS_CANCELLED) {
            return $this->success(
                new OrderResource($orderService->cancel($order)),
                'Order cancelled.',
            );
        }

        $order = DB::transaction(function () use ($order, $validated) {
            $paymentStatus = $validated['payment_status'] ?? $order->payment_status;

            if (in_array($validated['status'], [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED], true)
                && $paymentStatus === 'pending') {
                $paymentStatus = 'paid';
            }

            $order->update([
                'status' => $validated['status'],
                'payment_status' => $paymentStatus,
            ]);

            if ($order->payment) {
                $attributes = ['status' => $paymentStatus];

                if ($paymentStatus === 'paid' && ! $order->payment->paid_at) {
                    $attributes['paid_at'] = now();
                }

                $order->payment->update($attributes);
            }

            return $order->fresh(['items.product', 'payment', 'user']);
        });

        return $this->success(new OrderResource($order), 'Order status updated.');
    }
}
