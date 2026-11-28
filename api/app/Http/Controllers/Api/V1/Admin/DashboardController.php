<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** GET /api/v1/admin/stats — panel özeti: katalog + gelir + stok. */
    public function stats()
    {
        $totalRevenue = round((float) Order::revenue()->sum('total'), 2);
        $revenueCount = Order::revenue()->count();
        $avgOrderValue = $revenueCount > 0 ? round($totalRevenue / $revenueCount, 2) : 0;

        // Son 6 ay gelir (ay etiketleri Türkçe)
        $trMonths = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        $revenueByMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->startOfMonth()->subMonths($i);
            $total = Order::revenue()
                ->whereYear('placed_at', $m->year)
                ->whereMonth('placed_at', $m->month)
                ->sum('total');
            $revenueByMonth[] = [
                'month' => $m->format('Y-m'),
                'label' => $trMonths[$m->month],
                'total' => round((float) $total, 2),
            ];
        }

        // Duruma göre sipariş sayısı (tüm statüler, 0 dahil)
        $counts = Order::selectRaw('status, count(*) as c')->groupBy('status')->pluck('c', 'status');
        $ordersByStatus = collect(Order::STATUSES)->map(fn ($s) => [
            'status' => $s,
            'count' => (int) ($counts[$s] ?? 0),
        ])->values();

        // Çok satanlar (iptal hariç)
        $topProducts = OrderItem::select('product_name', DB::raw('SUM(qty) as qty'), DB::raw('SUM(line_total) as revenue'))
            ->whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled'))
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'name' => $r->product_name,
                'qty' => (int) $r->qty,
                'revenue' => round((float) $r->revenue, 2),
            ]);

        // Son siparişler
        $recentOrders = Order::latest('placed_at')->limit(5)->get()->map(fn ($o) => [
            'order_number' => $o->order_number,
            'customer_name' => $o->customer_name,
            'total' => $o->total,
            'status' => $o->status,
            'placed_at' => $o->placed_at,
        ]);

        // Envanter değeri = Σ stok × etkin fiyat
        $inventoryValue = round((float) DB::table('product_variants')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->sum(DB::raw('product_variants.stock * COALESCE(product_variants.price, products.discount_price, products.base_price)')), 2);

        // Kategoriye göre stok (alt kategoriye ana kategori adı eklenir: "Kadın Üst Giyim")
        $stockByCategory = Category::with(['products.variants', 'parent'])->get()
            ->map(fn ($c) => [
                'name' => $c->parent ? $c->parent->name.' '.$c->name : $c->name,
                'stock' => (int) $c->products->sum(fn ($p) => $p->variants->sum('stock')),
            ])
            ->filter(fn ($x) => $x['stock'] > 0)
            ->values();

        // Az / tükenen stok listeleri (ürün düzenlemeye link için product_id)
        $mapVariant = fn ($v) => [
            'product_id' => $v->product_id,
            'product_name' => $v->product?->name,
            'size' => $v->size,
            'color' => $v->color,
            'stock' => $v->stock,
        ];
        $lowStockItems = ProductVariant::with('product')->whereBetween('stock', [1, 5])->limit(20)->get()->map($mapVariant);
        $outOfStockItems = ProductVariant::with('product')->where('stock', 0)->limit(20)->get()->map($mapVariant);

        return response()->json([
            // Katalog
            'products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'categories' => Category::count(),
            'variants' => ProductVariant::count(),
            // Stok uyarı sayıları
            'low_stock' => ProductVariant::whereBetween('stock', [1, 5])->count(),
            'out_of_stock' => ProductVariant::where('stock', 0)->count(),
            'inventory_value' => $inventoryValue,
            'stock_by_category' => $stockByCategory,
            'low_stock_items' => $lowStockItems,
            'out_of_stock_items' => $outOfStockItems,
            // Gelir / sipariş
            'total_revenue' => $totalRevenue,
            'orders_count' => Order::count(),
            'avg_order_value' => $avgOrderValue,
            'revenue_by_month' => $revenueByMonth,
            'orders_by_status' => $ordersByStatus,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }
}
