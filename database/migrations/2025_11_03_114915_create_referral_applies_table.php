<?php

use Funeralzone\ValueObjects\Nullable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('referral_applies', function (Blueprint $table) {
            $table->id();
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('referral_code')->nullable();
            $table->string('code_applied_date')->nullable();
            $table->string('discount_percentage')->nullable();
            $table->bigInteger('referral_id')->nullable();
            $table->string('expire_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_applies');
    }
};
