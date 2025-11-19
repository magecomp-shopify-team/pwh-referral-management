<?php

namespace App\Http\Controllers;

use App\Models\BillingSumary;
use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Http\Request;
use App\Helpers\MetafieldHelper;
use Illuminate\Support\Facades\Auth;
class OrderAnalytics extends Controller
{
    public static function orderAnalytics($domain, $orderGid)
    {
        $user = User::where("name", $domain)->first();
        $orderResponse = null;
        if ($orderGid != "") {
            $orderResponse = MetafieldHelper::getOrderDetails($user, $orderGid);
        }
        if ($orderResponse && isset($orderResponse['body']['data']['order'])) {
            try {
                $orderData = $orderResponse['body']['data']['order'];
                $discountCode = null;
                $discountPercentage = null;

                if (
                    isset($orderData['discountApplications']['edges']) &&
                    !empty($orderData['discountApplications']['edges'])
                ) {

                    foreach ($orderData['discountApplications']['edges'] as $edge) {
                        $discountApp = $edge['node'];

                        if (
                            $discountApp['__typename'] === 'AutomaticDiscountApplication' &&
                            isset($discountApp['title']) &&
                            strpos($discountApp['title'], '::') !== false
                        ) {
                            $parts = explode('::', $discountApp['title']);
                            $discountCode = trim($parts[0]);
                            $discountDescription = trim($parts[1] ?? '');

                            if (preg_match('/(\d+)%/', $discountDescription, $matches)) {
                                $discountPercentage = $matches[1];
                            }

                            break;
                        }
                    }
                }

                info("Discount search result:", [
                    'discountCode' => $discountCode,
                    'orderName' => $orderData['name'] ?? 'Unknown',
                    'discountApplications' => $orderData['discountApplications']['edges'] ?? []
                ]);

                if ($discountCode) {
                    $referralCodeExists = ReferralCode::where('referral_code', $discountCode)->first();

                    if ($referralCodeExists) {
                        $totalAfterDiscount = floatval($orderData['totalPriceSet']['shopMoney']['amount']);
                        $totalDiscount = floatval($orderData['totalDiscountsSet']['shopMoney']['amount']);
                        $totalBeforeDiscount = $totalAfterDiscount + $totalDiscount;

                        BillingSumary::create([
                            'order_id' => $orderData['id'],
                            'order_name' => $orderData['name'],
                            'referral_code' => $discountCode,
                            'total_before_discount' => $totalBeforeDiscount,
                            'total_after_discount' => $totalAfterDiscount,
                            'customer_email' => $orderData['email'] ?? '',
                        ]);

                        info("Billing summary recorded for referral code: $discountCode", [
                            'order' => $orderData['name'] ?? '',
                            'email' => $orderData['email'] ?? '',
                            'total_before_discount' => $totalBeforeDiscount,
                            'total_after_discount' => $totalAfterDiscount,
                            'discount_percentage' => $discountPercentage
                        ]);

                        return [
                            'success' => true,
                            'referral_code' => $discountCode,
                            'message' => 'Billing summary recorded successfully'
                        ];
                    } else {
                        info("Referral code not found in database: $discountCode");
                        return [
                            'success' => false,
                            'message' => 'Referral code not found in database'
                        ];
                    }
                } else {
                    info("No valid automatic discount found in order: " . ($orderData['name'] ?? 'Unknown'));
                    return [
                        'success' => false,
                        'message' => 'No valid automatic discount found'
                    ];
                }

            } catch (\Exception $e) {
                info("Error processing order discount: " . $e->getMessage(), [
                    'order' => $orderData['name'] ?? 'Unknown',
                    'error' => $e->getTraceAsString()
                ]);

                return [
                    'success' => false,
                    'message' => 'Error processing discount: ' . $e->getMessage()
                ];
            }
        } else {
            info("No order data found in response");
            return [
                'success' => false,
                'message' => 'No order data found'
            ];
        }
    }
}
