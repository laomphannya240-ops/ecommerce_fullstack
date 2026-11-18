<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->withCount('items')
            ->with('payment')
            ->orderByDesc('placed_at')
            ->paginate(10)
            ->withQueryString();

        return $this->paginated($orders, OrderResource::class, 'Orders loaded.');
    }

    public function store(Request $request, CheckoutService $checkout): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_line1' => ['required', 'string', 'max:255'],
            'shipping_line2' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_state' => ['nullable', 'string', 'max:120'],
            'shipping_postal_code' => ['nullable', 'string', 'max:30'],
            'shipping_country' => ['nullable', 'string', 'max:120'],
            'payment_method' => ['required', Rule::in(config('store.payment_methods'))],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'address_id' => [
                'nullable',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $order = $checkout->place($request->user(), $validated);

        return $this->success(new OrderResource($order), 'Order placed successfully.', 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        $order->load(['items.product.category', 'items.product.brand', 'payment']);

        return $this->success(new OrderResource($order), 'Order loaded.');
    }

    public function cancel(Request $request, Order $order, OrderService $orderService): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        $cancelled = $orderService->cancel($order);

        return $this->success(new OrderResource($cancelled), 'Order cancelled.');
    }
}
