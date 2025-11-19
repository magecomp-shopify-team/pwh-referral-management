<?php

namespace App\Http\Controllers;

use App\Models\BillingSumary;
use Illuminate\Http\Request;
use App\Models\Referral;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ReferralCode;
use App\Models\ReferralApplies;

class ReferralController extends Controller
{
    public function storeReferral(Request $res)
    {
        $user_id = Auth::user()->id;

        DB::beginTransaction();

        try {
            $referral = Referral::create([
                'shop_id' => $user_id,
                'first_name' => $res->firstName ?? "",
                'last_name' => $res->lastName ?? "",
                'email' => $res->email ?? "",
                'phone' => $res->phone ?? "",
                'other_details' => $res->otherDetails ?? "",
                'status' => $res->status ?? "",
            ]);

            $referral->code()->create([
                'referral_code' => strtoupper($res->referralCode ?? ""),
                'discount_percentage' => $res->discount ?? "",
                'time_period' => $res->timePeriod ?? "",
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Referral and code stored successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Referral store error: ' . $e->getMessage());

            return response()->json([
                'status' => 0,
                'message' => 'Error while saving referral and code.',
            ], 500);
        }
    }

    public function getReferrals()
    {
        $referrals = Referral::with('code')->get()->map(function ($referral) {
            return array_merge(
                $referral->toArray(),
                $referral->code ? $referral->code->toArray() : []
            );
        });

        return response()->json([
            "status" => 1,
            "data" => $referrals ?? []
        ]);

    }

    public function getReferralForEdit($id)
    {
        try {
            $referral = Referral::with('code')->find($id);

            if (!$referral) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Referral not found',
                ], 404);
            }

            $referralData = array_merge(
                $referral->toArray(),
                $referral->code ? $referral->code->toArray() : []
            );

            return response()->json([
                'status' => 1,
                'data' => $referralData,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching referral details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateReferral(Request $request, $id)
    {
        try {
            $referral = Referral::with('code')->find($id);

            if (!$referral) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Referral not found',
                ], 404);
            }

            $referral->update([
                'first_name' => $request->firstName ?? "",
                'last_name' => $request->lastName ?? "",
                'email' => $request->email ?? "",
                'phone' => $request->phone ?? "",
                'other_details' => $request->otherDetails ?? "",
                'status' => $request->status ?? "",
            ]);

            if ($referral->code) {
                $referral->code->update([
                    'referral_code' => strtoupper($request->referralCode ?? $referral->code->referral_code),
                    'discount_percentage' => $request->discount ?? $referral->code->discount_percentage,
                    'time_period' => $request->timePeriod ?? $referral->code->time_period,
                ]);
            } else {
                $referral->code()->create([
                    'referral_code' => strtoupper($request->referralCode ?? ""),
                    'discount_percentage' => $request->discount ?? "",
                    'time_period' => $request->timePeriod ?? "",
                ]);
            }

            $referralData = array_merge(
                $referral->toArray(),
                $referral->code ? $referral->code->toArray() : []
            );

            return response()->json([
                'status' => 1,
                'message' => 'Referral updated successfully',
                'data' => $referralData,
            ]);

        } catch (\Exception $e) {
            \Log::error('Referral update error: ' . $e->getMessage());

            return response()->json([
                'status' => 0,
                'message' => 'Error while updating referral',
            ]);
        }
    }

    public function deleteReferral($id)
    {
        try {
            $referral = Referral::find($id)?->delete();

            if (!$referral) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Referral not found',
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Referral deleted successfully',
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting referral: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete referral',
            ], 500);
        }
    }

    public function getReferralDetails($id)
    {
        $referralCodeData = ReferralCode::with('referral')->where('referral_id', $id)->first();

        if (!$referralCodeData) {
            return response()->json([
                'status' => 0,
                'message' => 'Referral not found',
            ]);
        }
        return response()->json([
            'status' => 1,
            'data' => $referralCodeData,
        ]);

    }

    public function referralListForAnalytics()
    {
        $referrals = Referral::select('referrals.*')
            ->leftJoin('referral_codes', 'referral_codes.referral_id', '=', 'referrals.id')
            ->leftJoin('referral_applies', 'referral_applies.referral_code', '=', 'referral_codes.referral_code')
            ->selectRaw('COUNT(referral_applies.id) as applies_count')
            ->groupBy('referrals.id')
            ->get();

        return response()->json([
            "status" => 1,
            "data" => $referrals ?? []
        ]);
    }

    public function getReferralAnalytics($id)
    {
        $referrals = ReferralCode::with('referral')->where('referral_id', $id)->first();
        if ($referrals) {
            $referredCustomers = ReferralApplies::where('referral_code', $referrals->referral_code)->get();
            $summary = BillingSumary::where('referral_code', $referrals->referral_code)->get();
            $totalBefore = round($summary->sum('total_before_discount'), 2);
            $totalAfter = round($summary->sum('total_after_discount'), 2);
            $totalDiscount = $totalBefore - $totalAfter;
        }

        if (!$referrals) {
            return response()->json([
                "status" => 0,
                "message" => "No data found",
                "data" => []
            ]);
        }

        return response()->json([
            "status" => 1,
            "data" => [
                "referralData" => $referrals,
                "referredCustomers" => $referredCustomers,
                "totalBeforeDiscount" => $totalBefore,
                "totalAfterDiscount" => $totalAfter,
                "totalDiscount" => $totalDiscount,
            ]
        ]);
    }

}
