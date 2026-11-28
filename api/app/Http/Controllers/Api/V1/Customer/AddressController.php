<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /** Yalnız giriş yapan kullanıcının adresleri (cross-tenant yok). */
    public function index(Request $request)
    {
        return AddressResource::collection($request->user()->addresses()->latest()->get());
    }

    public function store(StoreAddressRequest $request)
    {
        $address = $request->user()->addresses()->create($request->validated());

        return (new AddressResource($address))->response()->setStatusCode(201);
    }

    public function update(StoreAddressRequest $request, int $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->update($request->validated());

        return new AddressResource($address);
    }

    public function destroy(Request $request, int $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Adres silindi.']);
    }
}
