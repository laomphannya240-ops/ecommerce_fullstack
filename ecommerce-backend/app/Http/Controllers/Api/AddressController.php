<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return $this->success(AddressResource::collection($addresses), 'Addresses loaded.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateAddress($request);
        $isFirstAddress = $request->user()->addresses()->doesntExist();

        $address = $request->user()->addresses()->create([
            ...$validated,
            'is_default' => $validated['is_default'] ?? $isFirstAddress,
        ]);

        if ($address->is_default) {
            $this->clearOtherDefaults($request, $address);
        }

        return $this->success(new AddressResource($address), 'Address saved.', 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);

        $validated = $this->validateAddress($request);
        $address->update($validated);

        if ($address->is_default) {
            $this->clearOtherDefaults($request, $address);
        }

        return $this->success(new AddressResource($address->fresh()), 'Address updated.');
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);
        $address->delete();

        if ($address->is_default) {
            $request->user()->addresses()->latest()->first()?->update(['is_default' => true]);
        }

        return $this->success(null, 'Address removed.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateAddress(Request $request): array
    {
        return $request->validate([
            'label' => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:120'],
            'is_default' => ['sometimes', 'boolean'],
        ]);
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        abort_unless($address->user_id === $request->user()->id, 404);
    }

    private function clearOtherDefaults(Request $request, Address $address): void
    {
        $request->user()
            ->addresses()
            ->whereKeyNot($address->getKey())
            ->update(['is_default' => false]);
    }
}
