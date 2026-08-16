<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Auth — public
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Lecture publique
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);

    // Commande en ligne sans compte (client invité)
    Route::post('orders/guest', [OrderController::class, 'store']);

    // Routes authentifiées
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Commande en ligne (takeaway) ou en salle (serveur)
        Route::post('orders', [OrderController::class, 'store']);

        // Staff (serveur, manager, admin)
        Route::middleware('role:serveur')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{order}', [OrderController::class, 'show']);
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
            Route::get('tables', [TableController::class, 'index']);
            Route::patch('tables/{table}/status', [TableController::class, 'updateStatus']);
            Route::get('payments/unpaid', [PaymentController::class, 'unpaid']);
            Route::post('payments', [PaymentController::class, 'store']);
            Route::get('notifications', [NotificationController::class, 'index']);
            Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
            Route::get('settings', [SettingsController::class, 'show']);
        });

        // Cuisine (changement de statut + lecture des commandes)
        Route::middleware('role:cuisine')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{order}', [OrderController::class, 'show']);
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        });

        // Manager & admin
        Route::middleware('role:manager')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{order}', [OrderController::class, 'show']);
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/staff', [UserController::class, 'staff']);
            Route::get('payments', [PaymentController::class, 'index']);

            // Gestion du menu
            Route::resource('products', ProductController::class)->except(['index', 'show']);
            Route::resource('categories', CategoryController::class)->except(['index', 'show']);
        });

        // Admin uniquement
        Route::middleware('role:admin')->group(function () {
            Route::get('tables', [TableController::class, 'index']);
            Route::post('tables', [TableController::class, 'store']);
            Route::patch('tables/{table}', [TableController::class, 'update']);
            Route::delete('tables/{table}', [TableController::class, 'destroy']);
            Route::post('users', [UserController::class, 'store']);
            Route::patch('users/{user}', [UserController::class, 'update']);
            Route::delete('users/{user}', [UserController::class, 'destroy']);
            Route::patch('settings', [SettingsController::class, 'update']);
        });
    });
});
