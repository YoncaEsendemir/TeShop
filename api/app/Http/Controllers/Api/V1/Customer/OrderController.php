<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /** GET /my-orders — yalnız giriş yapan kullanıcının siparişleri. */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->withCount('items')->latest('placed_at')->paginate(10);

        return OrderResource::collection($orders);
    }

    /** GET /my-orders/{id} — yalnız kendi siparişi. */
    public function show(Request $request, int $id)
    {
        $order = $request->user()->orders()->with('items')->findOrFail($id);

        return new OrderResource($order);
    }
}
