<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PaymentController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in([Payment::STATUS_PENDING, Payment::STATUS_PAID, Payment::STATUS_FAILED, Payment::STATUS_CANCELLED, Payment::STATUS_REFUNDED])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $payments = Payment::query()
            ->with('order.user')
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->paginated($payments, PaymentResource::class, 'Payments loaded.');
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load('order.user');

        return $this->success(new PaymentResource($payment), 'Payment loaded.');
    }

    public function updateStatus(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Payment::STATUS_PENDING, Payment::STATUS_PAID, Payment::STATUS_FAILED, Payment::STATUS_CANCELLED, Payment::STATUS_REFUNDED])],
        ]);

        DB::transaction(function () use ($payment, $validated) {
            $payment->update([
                'status' => $validated['status'],
                'paid_at' => $validated['status'] === Payment::STATUS_PAID ? ($payment->paid_at ?? now()) : $payment->paid_at,
            ]);

            $payment->order->update([
                'payment_status' => match ($validated['status']) {
                    Payment::STATUS_PAID => 'paid',
                    Payment::STATUS_FAILED => 'failed',
                    Payment::STATUS_REFUNDED => 'refunded',
                    Payment::STATUS_CANCELLED => 'cancelled',
                    default => 'pending',
                },
            ]);
        });

        return $this->success(new PaymentResource($payment->fresh()), 'Payment status updated.');
    }
}
