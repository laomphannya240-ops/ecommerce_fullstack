<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'transaction_id' => $this->transaction_id,
            'qr_payload' => $this->qr_payload,
            'order' => $this->whenLoaded('order', fn () => new OrderResource($this->order)),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
