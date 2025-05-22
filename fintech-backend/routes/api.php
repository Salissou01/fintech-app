<?php
use App\Http\Controllers\API\BiometricAuthController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\WalletController;
use App\Http\Controllers\API\TopupController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\TransferController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\UserController;
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/biometric-login', [BiometricAuthController::class, 'login']);


Route::post('/biometric-register', [BiometricAuthController::class, 'register']);


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

