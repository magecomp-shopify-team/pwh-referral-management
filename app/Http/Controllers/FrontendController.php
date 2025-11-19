<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\ReferralCode;
use App\Models\ReferralApplies;
use Carbon\Carbon;
use App\Helpers\MetafieldHelper;

class FrontendController extends Controller
{
    public function storeApplyCode(Request $request)
    {
        $user = User::where('name', $request->shop)->first();

        try {
            $referralCode = ReferralCode::where('referral_code', $request->referral_code)->first();
            if ($referralCode) {
                $referral = Referral::find($referralCode->referral_id);
            }

            if (!$referralCode) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid referral code.'
                ]);
            }

            if ($referral->status !== 'active') {
                return response()->json([
                    'status' => 0,
                    'message' => 'This referral is not active.'
                ]);
            }
            $alreadyEntry = ReferralApplies::where('customer_email', $request->email)->first();

            if ($alreadyEntry) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Referral already used.'
                ]);
            }

            $discount = $referralCode->discount_percentage;
            $timePeriod = (int) $referralCode->time_period;
            $referralId = $referralCode->referral_id;

            $appliedDate = Carbon::now();
            $expireDate = $appliedDate->copy()->addDays($timePeriod);

            ReferralApplies::create([
                'customer_email' => $request->email,
                'customer_name' => $request->name,
                'referral_code' => $request->referral_code,
                'code_applied_date' => $appliedDate->toDateString(),
                'discount_percentage' => $discount,
                'referral_id' => $referralId,
                'expire_date' => $expireDate->toDateString(),
                'shopify_customer_id' => $request->id,
            ]);

            $data = [
                'customer_id' => $request->id,
                'referral_code' => $request->referral_code,
                'applied_date' => Carbon::now(),
                'time_period' => $timePeriod,
                'discount' => $discount,
            ];

            $result = MetafieldHelper::setCustomerMetafield($user, $data);

            return response()->json([
                'status' => 1,
                'message' => 'Referral applied successfully!',
                'discount' => $discount,
                'expires_on' => $expireDate->toDateString()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error applying referral code: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong while applying the referral.'
            ]);
        }
    }

    public static function removeExpiredCoupons(Request $request)
    {
        $user = User::where('name', $request->shop)->first();
        $result = MetafieldHelper::removeReferralMetafield($user, $request->ownerId);
    }

    public function createFunctionDiscount(Request $request)
    {
        $user = User::where('name', $request->shop)->first();
        $result = json_decode(MetafieldHelper::getAppFunctions($user), true);
        $functionId = null;
        foreach ($result as $r) {
            if ($r['title'] === "pwh-discount") {
                $functionId = $r['id'];
                break;
            }
        }
        if ($functionId) {
            MetafieldHelper::createFunctionDiscount($user, $functionId);
        } else {
            info('No dicount function found with title pwh-discount');
        }
    }

    public function getCustomerCreationDate(Request $request)
    {
        $user = User::where('name', $request->shop)->first();

        if ($user) {
            $create_at = MetafieldHelper::getCustomerCreationDate($user, $request->customer_id);
            $formattedDate = Carbon::parse($create_at)->format('Y-m-d');
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'createdAt' => $formattedDate,
            ]
        ]);
    }


}
