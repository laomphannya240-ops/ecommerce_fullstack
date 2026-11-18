<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $customers = User::query()
            ->where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as orders_sum_total' => fn (Builder $query) => $query->where('status', '!=', Order::STATUS_CANCELLED)], 'total')
            ->when($validated['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->paginated($customers, UserResource::class, 'Customers loaded.');
    }

    public function show(User $customer): JsonResponse
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->loadCount('orders')
            ->loadSum(['orders as orders_sum_total' => fn (Builder $query) => $query->where('status', '!=', Order::STATUS_CANCELLED)], 'total');

        $orders = $customer->orders()
            ->withCount('items')
            ->with('payment')
            ->latest()
            ->limit(10)
            ->get();

        return $this->success([
            'customer' => new UserResource($customer),
            'orders' => OrderResource::collection($orders),
        ], 'Customer loaded.');
    }

    public function update(Request $request, User $customer): JsonResponse
    {
        abort_unless($customer->role === 'customer', 404);

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $customer->update(['is_active' => (bool) $validated['is_active']]);

        return $this->success(new UserResource($customer->fresh()), 'Customer updated.');
    }
}
