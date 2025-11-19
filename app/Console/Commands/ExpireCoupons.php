<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\ReferralApplies;
use App\Helpers\MetafieldHelper;

class ExpireCoupons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-coupons';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark expired referrals and remove their metafields from Shopify';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        info("Referral Expiry Scheduler started");

        $today = now()->format('Y-m-d');

        $referrals = ReferralApplies::where('expire_date', $today)->get();

        if ($referrals->isEmpty()) {
            info("No referrals expiring on {$today}");
            info("Scheduler ended");
            return;
        }

        $user = User::where('name', 'shubhamupadhyay.myshopify.com')->first();

        if (!$user) {
            info("No user found for shop: shubhamupadhyay.myshopify.com");
            info("Scheduler aborted");
            return;
        }

        foreach ($referrals as $referral) {
            try {
                $referral->expire_date = 'expired';
                $referral->save();

                MetafieldHelper::createExpiredMetafield($user, $referral->shopify_customer_id);
            } catch (\Exception $e) {
                info("Error expiring referral ID {$referral->id}: {$e->getMessage()}");
            }
        }

        info("Scheduler completed for {$today}");
    }

}
