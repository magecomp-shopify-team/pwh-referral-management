<?php

use App\Http\Controllers\FrontendController;
use App\Http\Controllers\ReferralController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['verify.shopify'])->group(function () {
    Route::post('/add-referral', [ReferralController::class, 'storeReferral']);

    Route::post('/get-referrals', [ReferralController::class, 'getReferrals']);

    Route::get('/get-referral/{id}', [ReferralController::class, 'getReferralForEdit']);

    Route::post('/update-referral/{id}', [ReferralController::class, 'updateReferral']);

    Route::post('/delete-referral/{id}', [ReferralController::class, 'deleteReferral']);

    Route::get('/get-referral-details/{id}', [ReferralController::class, 'getReferralDetails']);

    Route::get('/referrals-list-for-analytics', [ReferralController::class, 'referralListForAnalytics']);

    Route::get('/get-referral-analytics/{id}', [ReferralController::class, 'getReferralAnalytics']);
});

Route::post('/submit-referral', [FrontendController::class, 'storeApplyCode']);

Route::post('/remove-metafield', [FrontendController::class, 'removeExpiredCoupons']);

Route::post('/create-function-dicount', [FrontendController::class, 'createFunctionDiscount']);

Route::post('/get-customer-creation-date', [FrontendController::class, 'getCustomerCreationDate']);