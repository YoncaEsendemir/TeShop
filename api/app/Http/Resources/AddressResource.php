<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'line1' => $this->line1,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'is_default' => $this->is_default,
        ];
    }
}
