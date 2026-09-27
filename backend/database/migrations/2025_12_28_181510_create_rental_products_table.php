<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rental_products', function (Blueprint $table) {

            $table->unsignedBigInteger('rental_product_id')->primary();
            $table->foreign('rental_product_id')->references('product_id')->on('products')->onDelete('cascade');

            $table->enum('product_type', ['rental_product'])->default('rental_product');

            $table->decimal('hourly_rate',10,2);
            $table->decimal('daily_base_rate',10,2);
            $table->decimal('weekly_base_rate',10,2);
            $table->decimal('monthly_base_rate',10,2);
            
            $table->enum('transmission', ['automatic', 'manual', 'cvt', 'electric'])->default('automatic');
            $table->enum('fuel_type', ['diesel', 'gasoline', 'electric', 'hybrid', 'plug-in_hybrid'])->default('diesel');
            
            $table
                ->enum(
                        'rent_product_status',
                        ['available', 'rented', 'maintenance', 'cleaning', 'out_of_service']
                    )
                ->default('available');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_products');
    }
};
