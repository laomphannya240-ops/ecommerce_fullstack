<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'avatar_url' => Media::url($this->avatar),
            'role' => $this->role,
            'is_active' => (bool) $this->is_active,
            'orders_count' => $this->whenCounted('orders'),
            'total_spent' => $this->when(isset($this->orders_sum_total), fn () => round((float) $this->orders_sum_total, 2)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
