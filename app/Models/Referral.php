<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ReferralCode;

class Referral extends Model
{
    protected $table = "referrals";

    protected $fillable = [
        'shop_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'other_details',
        'status',
    ];

    public function code()
    {
        return $this->hasOne(ReferralCode::class);
    }

    protected static function booted()
    {
        static::deleting(function ($referral) {
            $referral->code()->delete();
        });
    }
}
