<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with(['user:id,name,email', 'product:id,name,slug'])->latest();

        if ($request->filled('status')) {
            $query->where('is_approved', $request->string('status')->toString() === 'approved');
        }

        $reviews = $query->paginate($request->integer('per_page', 15));

        return $this->success($reviews, 'Reviews loaded.');
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        $review->update(['is_approved' => (bool) $validated['is_approved']]);

        return $this->success($review->fresh(['user:id,name,email', 'product:id,name']), 'Review updated.');
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return $this->success(null, 'Review deleted.');
    }
}
