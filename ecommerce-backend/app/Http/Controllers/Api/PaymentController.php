<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string'],
            'payment_method' => ['required', 'in:cod,khqr'],
        ]);

        $order = $request->user()
            ->orders()
            ->where('order_number', $validated['order_number'])
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return $this->error('This order is already paid.', 422);
        }

        $payment = $order->payment()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_method' => $validated['payment_method'],
                'status' => Payment::STATUS_PENDING,
                'amount' => $order->total,
                'currency' => config('store.currency'),
                'qr_payload' => $validated['payment_method'] === 'khqr'
                    ? json_encode(['demo' => true, 'order' => $order->order_number, 'amount' => (float) $order->total])
                    : null,
            ],
        );

        return $this->success(new PaymentResource($payment), 'Payment created.', 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        $payment->load('order');
        abort_unless($payment->order->user_id === $request->user()->id, 404);

        return $this->success(new PaymentResource($payment), 'Payment loaded.');
    }

    /**
     * Demo verification endpoint. A production integration would verify the
     * transaction with the payment provider webhook before marking it paid.
     */
    public function verify(Request $request, Payment $payment): JsonResponse
    {
        abort_unless($payment->order->user_id === $request->user()->id, 404);

        if ($payment->status === Payment::STATUS_PAID) {
            return $this->success(new PaymentResource($payment->load('order')), 'Payment already verified.');
        }

        $payment->update([
            'status' => Payment::STATUS_PAID,
            'transaction_id' => 'DEMO-'.Str::upper(Str::random(12)),
            'paid_at' => now(),
        ]);

        $payment->order->update([
            'payment_status' => 'paid',
            'status' => $payment->order->status === Order::STATUS_PENDING
                ? Order::STATUS_PROCESSING
                : $payment->order->status,
        ]);

        return $this->success(new PaymentResource($payment->fresh()->load('order')), 'Payment verified.');
    }
}
