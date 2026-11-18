<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    private const IMAGE_QUERY = '?auto=format&fit=crop&w=1000&q=80';

    public function run(): void
    {
        $categories = $this->seedCategories();
        $brands = $this->seedBrands();
        $products = $this->seedProducts($categories, $brands);

        $this->seedBanners();
        $this->seedCoupons();
        $this->seedReviews($products);
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        $categories = [
            ['Audio & Tech', 'audio-tech', 'Headphones, speakers, and considered desk companions.', 'photo-1505740420928-5e560c06d30e', 1],
            ['Watches & Accessories', 'watches-accessories', 'Everyday carry, measured in minutes and millimetres.', 'photo-1523275335684-37898b6baf30', 2],
            ['Fashion', 'fashion', 'Quiet staples and statement layers for the season.', 'photo-1542291026-7eec264c27ff', 3],
            ['Home & Living', 'home-living', 'Objects that make a room feel finished.', 'photo-1567538096630-e0c55bd6374c', 4],
            ['Beauty & Care', 'beauty-care', 'Rituals, formulas, and slow mornings.', 'photo-1556228720-195a672e8a03', 5],
            ['Fitness & Outdoors', 'fitness-outdoors', 'Movement and open air, without the noise.', 'photo-1517836357463-d25dfeac3438', 6],
        ];

        $result = [];

        foreach ($categories as [$name, $slug, $description, $image, $order]) {
            $result[$slug] = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => $description,
                    'image' => $this->image($image),
                    'is_active' => true,
                    'sort_order' => $order,
                ],
            );
        }

        return $result;
    }

    /**
     * @return array<string, Brand>
     */
    private function seedBrands(): array
    {
        $brands = [
            ['Auralis', 'Signature audio and desk objects.'],
            ['Northbound', 'Outdoor goods built for slow weekends.'],
            ['Kinetic', 'Everyday movement, engineered.'],
            ['Lumen Home', 'Lighting, ceramics, and quiet interiors.'],
            ['Atelier No.9', 'Small-batch leather and tailoring.'],
            ['Verdant', 'Plant-forward care and botanical rituals.'],
            ['Tempo', 'Fitness essentials with a softer edge.'],
            ['Horizon', 'Watches for the long view.'],
        ];

        $result = [];

        foreach ($brands as [$name, $description]) {
            $result[$name] = Brand::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $description,
                    'is_active' => true,
                ],
            );
        }

        return $result;
    }

    /**
     * @param  array<string, Category>  $categories
     * @param  array<string, Brand>  $brands
     * @return array<string, Product>
     */
    private function seedProducts(array $categories, array $brands): array
    {
        $rows = [
            ['Studio Reference Headphones', 'audio-tech', 'Auralis', 289, 249, 18, true, 'photo-1505740420928-5e560c06d30e', 'Closed-back headphones tuned for long listening sessions.'],
            ['Orbit Portable Speaker', 'audio-tech', 'Auralis', 149, null, 30, true, 'photo-1608043152269-423dbba4e7e1', 'A palm-sized speaker with warm, room-filling sound.'],
            ['Meridian Mechanical Keyboard', 'audio-tech', 'Auralis', 179, 159, 14, false, 'photo-1587829741301-dc798b83add3', 'A low-profile mechanical keyboard with tactile switches.'],
            ['Drift Wireless Mouse', 'audio-tech', 'Auralis', 79, null, 42, false, 'photo-1527864550417-7fd91fc51a46', 'Sculpted, silent, and precise on any surface.'],
            ['Frame 27" Studio Display', 'audio-tech', 'Auralis', 549, 499, 7, true, 'photo-1527443224154-c4a3942d3acf', 'A colour-accurate display for editing and design.'],
            ['Analog Field Camera', 'audio-tech', 'Horizon', 399, null, 5, false, 'photo-1516035069371-29a1b244cc32', 'A compact camera for deliberate, offline picture-making.'],
            ['Atlas Automatic Watch', 'watches-accessories', 'Horizon', 459, 399, 9, true, 'photo-1523275335684-37898b6baf30', 'A 38mm automatic with a sandblasted dial and sapphire crystal.'],
            ['Fold Card Wallet', 'watches-accessories', 'Atelier No.9', 65, null, 60, false, 'photo-1627123424574-724758594e93', 'Full-grain leather, three pockets, no bulk.'],
            ['Noon Sunglasses', 'watches-accessories', 'Atelier No.9', 129, 109, 24, true, 'photo-1572635196237-14b3f281503f', 'Hand-polished acetate frames with amber lenses.'],
            ['Woven Market Tote', 'watches-accessories', 'Atelier No.9', 59, null, 45, false, 'photo-1544816155-12df9643f363', 'A sturdy everyday tote in washed canvas.'],
            ['Runner 02 Sneaker', 'fashion', 'Kinetic', 165, 139, 22, true, 'photo-1542291026-7eec264c27ff', 'A light daily runner with a suede and mesh upper.'],
            ['Canvas Work Jacket', 'fashion', 'Northbound', 189, null, 16, true, 'photo-1551028719-00167b16eac5', 'A chore jacket cut for layering, in heavyweight cotton.'],
            ['Essential Heavy Tee', 'fashion', 'Northbound', 45, 39, 80, false, 'photo-1521572163474-6864f9cf17ab', 'Dense jersey, boxy fit, garment-dyed in small batches.'],
            ['Relaxed Selvedge Denim', 'fashion', 'Atelier No.9', 149, null, 20, false, 'photo-1542272604-787c3835535d', 'A straight leg with a clean break and honest hardware.'],
            ['Silk Slip Dress', 'fashion', 'Atelier No.9', 219, 189, 12, true, 'photo-1595777457583-95e059d581b8', 'Bias-cut silk with an adjustable strap.'],
            ['Trail Leather Boot', 'fashion', 'Northbound', 239, null, 11, false, 'photo-1608256246200-53e635b5b65f', 'A weather-ready boot with a lugged sole.'],
            ['Arc Lounge Chair', 'home-living', 'Lumen Home', 699, 599, 6, true, 'photo-1567538096630-e0c55bd6374c', 'A low-slung lounge chair in smoked oak and bouclé.'],
            ['Dome Table Lamp', 'home-living', 'Lumen Home', 129, null, 26, true, 'photo-1507473885765-e6ed057f782c', 'A warm, dimmable light for desks and bedside tables.'],
            ['Hand-thrown Stoneware Mug', 'home-living', 'Lumen Home', 32, null, 90, false, 'photo-1514228742587-6b1558fcca3d', 'Speckled clay with a soft matte glaze.'],
            ['Linen Throw Blanket', 'home-living', 'Lumen Home', 89, 75, 34, false, 'photo-1584100936595-c0654b55a2e2', 'Stonewashed linen that softens with every wash.'],
            ['Sculptural Ceramic Vase', 'home-living', 'Lumen Home', 54, null, 28, false, 'photo-1578500494198-246f612d3b3d', 'An irregular silhouette for stems and single branches.'],
            ['Walnut Writing Desk', 'home-living', 'Lumen Home', 849, 749, 4, true, 'photo-1518455027359-f3f8164ba6bd', 'A compact desk with a cable channel and soft-close drawer.'],
            ['Pour-over Coffee Set', 'home-living', 'Lumen Home', 79, null, 40, false, 'photo-1517668808822-9ebb02f2a0e6', 'A glass carafe, ceramic dripper, and measuring spoon.'],
            ['Electric Gooseneck Kettle', 'home-living', 'Auralis', 119, 99, 19, false, 'photo-1594213114663-d94db9b17125', 'Variable temperature control with a balanced pour.'],
            ['Daily Botanical Face Oil', 'beauty-care', 'Verdant', 68, null, 37, true, 'photo-1556228720-195a672e8a03', 'Cold-pressed oils for a calm, hydrated finish.'],
            ['Cedar & Smoke Candle', 'beauty-care', 'Verdant', 42, 36, 55, true, 'photo-1602874801007-bd458bb1b8b6', 'Hand-poured soy wax with cedar, tobacco, and smoke.'],
            ['Ritual Hand Cream', 'beauty-care', 'Verdant', 28, null, 70, false, 'photo-1570194065650-d99fb4bedf0a', 'A rich, fast-absorbing cream with neroli.'],
            ['Eau de Parfum No.4', 'beauty-care', 'Atelier No.9', 145, 125, 15, true, 'photo-1541643600914-78b084683601', 'Bergamot, fig leaf, and a quiet cedar base.'],
            ['Cork Yoga Mat', 'fitness-outdoors', 'Tempo', 98, null, 25, false, 'photo-1592432678016-e910b452f9a2', 'Natural cork with a grippy, sweat-friendly surface.'],
            ['Cast Iron Dumbbell Pair', 'fitness-outdoors', 'Tempo', 129, 109, 13, false, 'photo-1517836357463-d25dfeac3438', 'Compact pairs for small spaces and slow strength work.'],
            ['Trail Daypack 18L', 'fitness-outdoors', 'Northbound', 139, null, 21, true, 'photo-1553062407-98eeb64c6a62', 'A weatherproof pack for day hikes and city commutes.'],
            ['Pocket Field Notebook', 'fitness-outdoors', 'Northbound', 24, null, 110, false, 'photo-1531346878377-a5be20888e57', 'Water-resistant paper for notes in any weather.'],
        ];

        $result = [];
        $galleryPool = [
            'photo-1490481651871-ab68de25d43d',
            'photo-1441986300917-64674bd600d8',
            'photo-1497366216548-37526070297c',
            'photo-1445205170230-053b83016050',
            'photo-1616486338812-3dadae4b4ace',
            'photo-1485955900006-10f4d324d411',
            'photo-1512820790803-83ca734da794',
            'photo-1523275335684-37898b6baf30',
        ];

        foreach ($rows as $index => [$name, $categorySlug, $brandName, $price, $salePrice, $stock, $featured, $photo, $shortDescription]) {
            $slug = Str::slug($name);

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $categories[$categorySlug]->id,
                    'brand_id' => $brands[$brandName]->id,
                    'name' => $name,
                    'sku' => 'LMN-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'short_description' => $shortDescription,
                    'description' => $shortDescription.' Designed in-house and made in small production runs. '.fake()->sentence(18),
                    'price' => $price,
                    'sale_price' => $salePrice,
                    'stock_quantity' => $stock,
                    'low_stock_threshold' => 5,
                    'thumbnail' => $this->image($photo),
                    'is_active' => true,
                    'is_featured' => $featured,
                ],
            );

            $product->images()->firstOrCreate(
                ['image_path' => $this->image($photo)],
                ['alt_text' => $name, 'sort_order' => 0, 'is_primary' => true],
            );

            $secondary = $this->image($galleryPool[$index % count($galleryPool)]);
            $product->images()->firstOrCreate(
                ['image_path' => $secondary],
                ['alt_text' => $name.' detail', 'sort_order' => 1, 'is_primary' => false],
            );

            $result[$slug] = $product;
        }

        return $result;
    }

    private function seedBanners(): void
    {
        $banners = [
            [
                'title' => 'Objects for a considered life',
                'subtitle' => 'A quiet edit of everyday essentials, chosen for how they feel and how long they last.',
                'image_path' => $this->image('photo-1441986300917-64674bd600d8'),
                'link_url' => '/products',
                'position' => 'hero',
                'sort_order' => 1,
            ],
            [
                'title' => 'The home edit',
                'subtitle' => 'Warm light, honest materials, and the small things that finish a room.',
                'image_path' => $this->image('photo-1616486338812-3dadae4b4ace'),
                'link_url' => '/products?category=home-living',
                'position' => 'hero',
                'sort_order' => 2,
            ],
            [
                'title' => 'New season, new rhythm',
                'subtitle' => 'Layers and accessories made for the weeks between summer and fall.',
                'image_path' => $this->image('photo-1445205170230-053b83016050'),
                'link_url' => '/products?category=fashion',
                'position' => 'hero',
                'sort_order' => 3,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title']],
                [...$banner, 'is_active' => true],
            );
        }
    }

    private function seedCoupons(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => null,
                'max_discount_amount' => 25,
                'usage_limit' => null,
                'per_user_limit' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'SAVE20',
                'type' => 'fixed',
                'value' => 20,
                'min_order_amount' => 100,
                'max_discount_amount' => null,
                'usage_limit' => 200,
                'per_user_limit' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'STUDIO5',
                'type' => 'fixed',
                'value' => 5,
                'min_order_amount' => 40,
                'max_discount_amount' => null,
                'usage_limit' => null,
                'per_user_limit' => null,
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(['code' => $coupon['code']], $coupon);
        }
    }

    /**
     * @param  array<string, Product>  $products
     */
    private function seedReviews(array $products): void
    {
        $reviews = [
            ['customer@lumen.test', 'studio-reference-headphones', 5, 'Worth every cent', 'The sound is balanced and the earcups stay comfortable for a full workday.'],
            ['maya@example.com', 'studio-reference-headphones', 4, 'Excellent, slightly tight', 'Beautiful detail. I needed a few days to break in the headband.'],
            ['daniel@example.com', 'atlas-automatic-watch', 5, 'My everyday watch', 'The size is perfect and the dial catches light without being flashy.'],
            ['priya@example.com', 'arc-lounge-chair', 5, 'The room feels finished', 'Sturdy, comfortable, and the fabric is even better in person.'],
            ['lucas@example.com', 'runner-02-sneaker', 4, 'Light and quick', 'Great for daily runs. I would size up half a size.'],
            ['aiko@example.com', 'daily-botanical-face-oil', 5, 'A calm morning ritual', 'Absorbs quickly and leaves my skin soft without feeling greasy.'],
            ['customer@lumen.test', 'dome-table-lamp', 5, 'Perfect warm light', 'The dimmer goes lower than expected, which is exactly what I wanted.'],
        ];

        foreach ($reviews as [$email, $productSlug, $rating, $title, $comment]) {
            $user = User::where('email', $email)->first();
            $product = $products[$productSlug] ?? null;

            if (! $user || ! $product) {
                continue;
            }

            Review::updateOrCreate(
                ['user_id' => $user->id, 'product_id' => $product->id],
                [
                    'rating' => $rating,
                    'title' => $title,
                    'comment' => $comment,
                    'is_approved' => true,
                ],
            );
        }
    }

    private function image(string $photo): string
    {
        return 'https://images.unsplash.com/'.$photo.self::IMAGE_QUERY;
    }
}
