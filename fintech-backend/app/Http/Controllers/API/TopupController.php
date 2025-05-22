<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Topup;
use App\Models\Transaction;

class TopupController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'amount'   => 'required|numeric|min:1',
            'provider' => 'required|string',
        ]);

        $user = $request->user();

        // 1. Ajouter le topup
        $topup = $user->topups()->create([
            'amount'    => $request->amount,
            'provider'  => $request->provider,
            'reference' => 'TX-' . strtoupper(uniqid())
        ]);

        // 2. Ajouter une transaction
        $user->transactions()->create([
            'type'        => 'credit',
            'amount'      => $request->amount,
            'description' => 'Recharge via ' . $request->provider
        ]);

        // 3. Mettre à jour le solde
        $wallet = $user->wallet;
        $wallet->balance += $request->amount;
        $wallet->save();

        return response()->json([
            'message' => 'Recharge successful',
            'topup'   => $topup,
            'new_balance' => $wallet->balance
        ]);
        $user->notifications()->create([
        'title' => 'Recharge réussie',
        'message' => "Votre compte a été rechargé de {$request->amount} FCFA via {$request->provider}"
        ]);

    }
}
