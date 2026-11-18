<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends ApiController
{
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->where('placed_at', '>=', now()->subMonths(5)->startOfMonth())
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->get(['placed_at', 'total']);

        $monthlyRows = $orders->groupBy(fn (Order $order) => $order->placed_at->format('Y-m'));

        $monthlyRevenue = collect(range(5, 0))->map(function (int $monthsAgo) use ($monthlyRows) {
            $month = Carbon::now()->subMonths($monthsAgo)->format('Y-m');
            $rows = $monthlyRows->get($month, collect());

            return [
                'month' => $month,
                'revenue' => round((float) $rows->sum('total'), 2),
                'orders' => $rows->count(),
            ];
        })->values();

        $topCategories = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('categories.name, SUM(order_items.total_price) as revenue, SUM(order_items.quantity) as units')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->limit(6)
            ->get();

        $paymentBreakdown = Payment::query()
            ->selectRaw('payment_method, COUNT(*) as total, SUM(amount) as amount')
            ->groupBy('payment_method')
            ->get();

        return $this->success([
            'monthly_revenue' => $monthlyRevenue,
            'top_categories' => $topCategories,
            'payment_breakdown' => $paymentBreakdown,
            'average_order_value' => round((float) Order::where('status', '!=', Order::STATUS_CANCELLED)->avg('total'), 2),
        ], 'Report loaded.');
    }
}
