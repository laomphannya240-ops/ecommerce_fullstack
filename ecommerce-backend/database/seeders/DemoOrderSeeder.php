<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoOrderSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $products = Product::query()->get()->keyBy('slug');
        $customer = User::where('email', 'customer@lumen.test')->first();

        if (! $customer) {
            return;
        }

        Address::updateOrCreate(
            ['user_id' => $customer->id, 'label' => 'Home'],
            [
                'recipient_name' => $customer->name,
                'phone' => $customer->phone ?? '+855 92 111 222',
                'line1' => 'No. 24, Street 240',
                'line2' => 'Sangkat Chaktomuk',
                'city' => 'Phnom Penh',
                'state' => 'Phnom Penh',
                'postal_code' => '12207',
                'country' => 'Cambodia',
                'is_default' => true,
            ],
        );

        $specs = [
            ['customer@lumen.test', 'delivered', 'paid', 'khqr', 2, ['atlas-automatic-watch' => 1, 'daily-botanical-face-oil' => 2]],
            ['maya@example.com', 'completed', 'paid', 'cod', 4, ['arc-lounge-chair' => 1, 'hand-thrown-stoneware-mug' => 2]],
            ['daniel@example.com', 'delivered', 'paid', 'khqr', 5, ['studio-reference-headphones' => 1]],
            ['priya@example.com', 'shipped', 'paid', 'cod', 1, ['linen-throw-blanket' => 1, 'cedar-smoke-candle' => 2]],
            ['lucas@example.com', 'processing', 'paid', 'khqr', 3, ['runner-02-sneaker' => 1, 'essential-heavy-tee' => 2]],
            ['aiko@example.com', 'processing', 'pending', 'cod', 0, ['dome-table-lamp' => 1, 'ritual-hand-cream' => 1]],
            ['customer@lumen.test', 'pending', 'pending', 'cod', 1, ['canvas-work-jacket' => 1]],
            ['maya@example.com', 'completed', 'paid', 'khqr', 9, ['pour-over-coffee-set' => 1, 'electric-gooseneck-kettle' => 1]],
            ['daniel@example.com', 'cancelled', 'cancelled', 'cod', 7, ['trail-leather-boot' => 1]],
            ['priya@example.com', 'completed', 'paid', 'khqr', 12, ['trail-daypack-18l' => 1, 'cork-yoga-mat' => 1]],
            ['lucas@example.com', 'delivered', 'paid', 'cod', 14, ['noon-sunglasses' => 1, 'fold-card-wallet' => 1]],
            ['aiko@example.com', 'delivered', 'paid', 'khqr', 6, ['eau-de-parfum-no4' => 1]],
        ];

        foreach ($specs as $index => [$email, $status, $paymentStatus, $method, $daysAgo, $items]) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                continue;
            }

            $placedAt = Carbon::now()->subDays($daysAgo)->setTime(10 + ($index % 8), 15);
            $orderNumber = 'LMN-D'.Carbon::now()->format('ymd').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT);

            $subtotal = 0.0;
            $lineItems = [];

            foreach ($items as $slug => $quantity) {
                $product = $products->get($slug);

                if (! $product) {
                    continue;
                }

                $unitPrice = (float) ($product->sale_price ?? $product->price);
                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $lineItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                ];
            }

            if ($lineItems === []) {
                continue;
            }

            $subtotal = round($subtotal, 2);
            $shippingFee = $subtotal >= (float) config('store.shipping.free_over') ? 0.0 : (float) config('store.shipping.flat_fee');

            $order = Order::firstOrCreate(
                ['order_number' => $orderNumber],
                [
                    'user_id' => $user->id,
                    'status' => $status,
                    'payment_status' => $paymentStatus,
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'shipping_fee' => $shippingFee,
                    'total' => round($subtotal + $shippingFee, 2),
                    'shipping_name' => $user->name,
                    'shipping_phone' => $user->phone ?? '+855 12 000 000',
                    'shipping_line1' => 'No. 24, Street 240',
                    'shipping_city' => 'Phnom Penh',
                    'shipping_state' => 'Phnom Penh',
                    'shipping_postal_code' => '12207',
                    'shipping_country' => 'Cambodia',
                    'placed_at' => $placedAt,
                    'cancelled_at' => $status === Order::STATUS_CANCELLED ? $placedAt->copy()->addDay() : null,
                ],
            );

            if ($order->items()->doesntExist()) {
                $order->items()->createMany($lineItems);
            }

            Payment::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'payment_method' => $method,
                    'status' => $paymentStatus === 'paid'
                        ? Payment::STATUS_PAID
                        : ($paymentStatus === 'cancelled' ? Payment::STATUS_CANCELLED : Payment::STATUS_PENDING),
                    'amount' => $order->total,
                    'currency' => config('store.currency'),
                    'transaction_id' => $paymentStatus === 'paid' ? 'DEMO-'.str_pad((string) ($index + 1), 10, '0', STR_PAD_LEFT) : null,
                    'paid_at' => $paymentStatus === 'paid' ? $placedAt->copy()->addHour() : null,
                ],
            );
        }
    }
}
