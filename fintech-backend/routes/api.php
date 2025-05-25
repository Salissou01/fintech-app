<?php
use App\Http\Controllers\API\BiometricAuthController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\WalletController;
use App\Http\Controllers\API\TopupController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\TransferController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\AdminAuthController;
use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\AdminTopupController;
use App\Http\Controllers\API\AdminTransferController;
use App\Http\Controllers\API\AdminNotificationController;
use App\Http\Controllers\API\AdminWalletController;
//Route::post('/register', [AuthController::class, 'register']);
//Route::post('/login', [AuthController::class, 'login']);
Route::post('/biometric-register', [BiometricAuthController::class, 'register']);
Route::post('/biometric-login', [BiometricAuthController::class, 'login']);


Route::prefix('admin')->group(function () {
    Route::post('/register', [AdminAuthController::class, 'register']);
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Routes protégées par Sanctum pour admin
Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    
    
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/topups', [AdminTopupController::class, 'index']);
    Route::post('/admin/topups', [AdminTopupController::class, 'store']);
    Route::get('/admin/transfers', [AdminTransferController::class, 'index']);
    Route::post('/admin/transfers', [AdminTransferController::class, 'store']);
   Route::get('/admin/wallets', [AdminWalletController::class, 'index']);
    Route::get('/admin/notifications', [AdminNotificationController::class, 'index']);
    Route::post('/admin/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
});





// Routes protegées par sanctum pour USER
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/topup', [TopupController::class, 'store']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    
    Route::post('/transfer', [TransferController::class, 'store']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    
    Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'show']);


});

