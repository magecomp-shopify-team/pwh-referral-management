<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralApplies extends Model
{
    protected $table = 'referral_applies';

    protected $fillable = [
        'customer_email',
        'customer_name',
        'referral_code',
        'code_applied_date',
        'discount_percentage',
        'referral_id',
        'expire_date',
        'shopify_customer_id',
    ];
}
