<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends ApiController
{
    public function index(): JsonResponse
    {
        $sales = Order::query()
            ->where('placed_at', '>=', now()->subDays(6)->startOfDay())
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('DATE(placed_at) as day, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $salesChart = collect(range(6, 0))->map(function (int $daysAgo) use ($sales) {
            $date = Carbon::today()->subDays($daysAgo)->toDateString();
            $row = $sales->get($date);

            return [
                'date' => $date,
                'revenue' => round((float) ($row->revenue ?? 0), 2),
                'orders' => (int) ($row->orders ?? 0),
            ];
        })->values();

        $statusBreakdown = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return $this->success([
            'stats' => [
                'total_revenue' => round((float) Order::where('payment_status', 'paid')->sum('total'), 2),
                'revenue_today' => round((float) Order::where('payment_status', 'paid')->whereDate('placed_at', today())->sum('total'), 2),
                'orders_count' => Order::count(),
                'orders_today' => Order::whereDate('placed_at', today())->count(),
                'pending_orders' => Order::whereIn('status', [Order::STATUS_PENDING, Order::STATUS_PROCESSING])->count(),
                'customers_count' => User::where('role', 'customer')->count(),
                'products_count' => Product::count(),
                'low_stock_count' => Product::where('stock_quantity', '>', 0)
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->count(),
            ],
            'sales_chart' => $salesChart,
            'status_breakdown' => collect(Order::statuses())
                ->mapWithKeys(fn (string $status) => [$status => (int) ($statusBreakdown[$status] ?? 0)]),
            'recent_orders' => OrderResource::collection(
                Order::query()
                    ->with(['user', 'payment'])
                    ->withCount('items')
                    ->latest()
                    ->limit(8)
                    ->get()
            ),
            'top_products' => ProductResource::collection(
                Product::query()
                    ->with(['category', 'brand'])
                    ->withCount('orderItems')
                    ->orderByDesc('order_items_count')
                    ->limit(5)
                    ->get()
            ),
            'low_stock_products' => ProductResource::collection(
                Product::query()
                    ->where('stock_quantity', '>', 0)
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->orderBy('stock_quantity')
                    ->limit(6)
                    ->get()
            ),
        ], 'Dashboard loaded.');
    }
}
