<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingSumary extends Model
{
    protected $table = 'billing_summary';

    protected $fillable = [
        'order_id',
        'order_name',
        'referral_code',
        'total_before_discount',
        'total_after_discount',
        'customer_email',
    ];
}
