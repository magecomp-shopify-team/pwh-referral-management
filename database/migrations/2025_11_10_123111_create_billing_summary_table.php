<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billing_summary', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->nullable();
            $table->string('order_name')->nullable();
            $table->string('referral_code')->nullable();
            $table->decimal('total_before_discount', 10, 2)->nullable();
            $table->decimal('total_after_discount', 10, 2)->nullable();
            $table->text('customer_email')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_summary');
    }
};
