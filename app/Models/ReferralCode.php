<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    protected $table = 'referral_codes';

    protected $fillable = [
        'referral_id',
        'referral_code',
        'discount_percentage',
        'time_period',
    ];

    public function referral()
    {
        return $this->belongsTo(Referral::class);
    }
}
