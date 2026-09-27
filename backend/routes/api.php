<?php

use App\Http\Controllers\admin\AuthController;
use App\Http\Controllers\admin\BrandController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\OrderController;
use App\Http\Controllers\admin\PermissionController;
use App\Http\Controllers\admin\ProductController;
use App\Http\Controllers\admin\RoleController;
use App\Http\Controllers\admin\UserController;
use App\Http\Controllers\dealer\ProductController as DealerProductController;
use App\Http\Controllers\engineer\ProductController as EngineerProductController;
use App\Http\Controllers\farmer\OrderController as FarmerOrderController;
use App\Http\Controllers\front\ProductController as FrontProductController;
use App\Http\Controllers\front\AccountController;
use App\Http\Controllers\TempImageController;
use App\Http\Controllers\PlantDiagnosisController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


// ==================== Public Routes (Public APIs) ====================
Route::post('admin/login', [AuthController::class, 'authenticate']);
Route::post('login', [AccountController::class, 'authenticate']);
Route::post('register', [AccountController::class, 'register']);

Route::get('get-purhcased-products', [FrontProductController::class, 'getPurchasedProducts']);
Route::get('get-rental-products', [FrontProductController::class, 'getRentalProducts']);
Route::get('get-latest-equipment-products', [FrontProductController::class, 'getLatestEquipmentProducts']);
Route::get('get-latest-medicine-products', [FrontProductController::class, 'getLatestMedicineProducts']);
Route::get('get-latest-insecticide-products', [FrontProductController::class, 'getLatestInsecticideProducts']);
Route::get('get-latest-seeder-products', [FrontProductController::class, 'getLatestSeedProducts']);
Route::get('get-latest-purchased-products', [FrontProductController::class, 'getLatestPurchasedProducts']);
Route::get('get-latest-rental-products', [FrontProductController::class, 'getLatestRentalProducts']);
Route::get('get-product/{id}', [FrontProductController::class, 'getProduct']);
Route::get('get-categories', [FrontProductController::class, 'getCategories']);
Route::get('get-brands', [FrontProductController::class, 'getBrands']);


// ==================== Private Routes (Private APIs) ====================
Route::group(['middleware' => 'auth:sanctum'], function() {

    // ========== Admin Routes (Admin APIs) ==========
    Route::group(['middleware' => 'checkAdminRole'], function() {

        // User Routes (User APIs)
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);

        // Permission Routes (Permission APIs)
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::get('permissions/{id}', [PermissionController::class, 'show']);
        Route::post('permissions', [PermissionController::class, 'store']);
        Route::put('permissions/{id}', [PermissionController::class, 'update']);
        Route::delete('permissions/{id}', [PermissionController::class, 'destroy']);

        // Role Routes (Role APIs)
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('roles/{id}', [RoleController::class, 'show']);
        Route::post('roles', [RoleController::class, 'store']);
        Route::put('roles/{id}', [RoleController::class, 'update']);
        Route::delete('roles/{id}', [RoleController::class, 'destroy']);

        // Category Routes (Category APIs)
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{id}', [CategoryController::class, 'show']);
        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{id}', [CategoryController::class, 'update']);
        Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

        // Brand Routes (Brand APIs)
        Route::get('brands', [BrandController::class, 'index']);
        Route::get('brands/{id}', [BrandController::class, 'show']);
        Route::post('brands', [BrandController::class, 'store']);
        Route::put('brands/{id}', [BrandController::class, 'update']);
        Route::delete('brands/{id}', [BrandController::class, 'destroy']);

        // Product Routes (Product APIs)
        Route::get('products', [ProductController::class, 'index']);
        Route::get('products/{id}', [ProductController::class, 'show']);
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{id}', [ProductController::class, 'update']);
        Route::delete('products/{id}', [ProductController::class, 'destroy']);

        // Order Routes (Order APIs)
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{id}', [OrderController::class, 'detail']);
        Route::put('orders/{id}', [OrderController::class, 'update']);
        Route::delete('orders/{id}', [OrderController::class, 'destroy']);
    });

    // ========== Farmer Routes (Farmer APIs) ==========
    Route::group(['middleware' => 'checkFarmerRole'], function() {
        Route::post('save-purchased-order', [FarmerOrderController::class, 'savePurchasedOrder']);
        Route::post('save-rental-order', [FarmerOrderController::class, 'saveRentalOrder']);
        Route::get('get-order-details/{id}', [AccountController::class, 'getOrderDetails']);
        Route::get('get-orders', [AccountController::class, 'getOrders']);
    });

    // ========== Engineer Routes (Engineer APIs) ==========
    Route::group(['middleware' => 'checkEngineerRole'], function() {
        // Engineer Product Routes (Engineer Product APIs)
        Route::get('get-engineer-products', [EngineerProductController::class, 'getEngineerProducts']);
        Route::get('get-engineer-product/{id}', [EngineerProductController::class, 'getEngineerProduct']);
        Route::post('save-engineer-product', [EngineerProductController::class, 'saveEngineerProduct']);
        Route::put('update-engineer-product/{id}', [EngineerProductController::class, 'updateEngineerProduct']);
        Route::delete('delete-engineer-product/{id}', [EngineerProductController::class, 'deleteEngineerProduct']);
    });

    // ========== Dealer Routes (Dealer APIs) ==========
    Route::group(['middleware' => 'checkDealerRole'], function() {
        // Dealer Product Routes (Dealer Product APIs)
        Route::get('get-dealer-products', [DealerProductController::class, 'getDealerProducts']);
        Route::get('get-dealer-product/{id}', [DealerProductController::class, 'getDealerProduct']);
        Route::post('save-dealer-product', [DealerProductController::class, 'saveDealerProduct']);
        Route::put('update-dealer-product/{id}', [DealerProductController::class, 'updateDealerProduct']);
        Route::delete('delete-dealer-product/{id}', [DealerProductController::class, 'deleteDealerProduct']);
    });

    // ========== Product Image Routes (Image APIs) ==========
    Route::group(['middleware' => 'check.any.role:admin,engineer,dealer'], function() {
        Route::post('temp-images', [TempImageController::class, 'store']);
        Route::delete('delete-temp-image/{id}', [TempImageController::class, 'destroy']);
        Route::post('save-product-image', [ProductController::class, 'saveProductImage']);
        Route::post('change-product-default-image', [ProductController::class, 'updateDefaultImage']);
        Route::delete('delete-product-image/{id}', [ProductController::class, 'deleteProductImage']);
    });

    // ========== Account Routes (User APIs) ==========
    Route::group(['middleware' => 'check.any.role:farmer,engineer,dealer'], function() {
        Route::get('get-profile-details', [AccountController::class, 'getAccountDetails']);
        Route::post('update-profile', [AccountController::class, 'updateProfile']);
        Route::post('save-user-image', [AccountController::class, 'saveUserImage']);
        Route::post('change-user-default-image', [AccountController::class, 'updateDefaultUserImage']);

        // AI Routes (Plant disease/pest diagnosis via Gemini)
        Route::post('diagnose-plant-image', [PlantDiagnosisController::class, 'diagnose']);
    });
});