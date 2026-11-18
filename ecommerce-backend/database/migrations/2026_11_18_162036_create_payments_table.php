<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method'); // khqr, cod
            $table->string('status')->default('pending')->index(); // pending, paid, failed, cancelled, refunded
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('transaction_id')->nullable()->unique();
            $table->string('provider_reference')->nullable()->index();
            $table->text('qr_payload')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
