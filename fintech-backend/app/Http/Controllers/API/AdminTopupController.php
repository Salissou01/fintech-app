<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Topup;
use App\Models\User;
use Illuminate\Http\Request;

class AdminTopupController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Topup::with('user')
            ->orderByDesc('created_at');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%");
            });
        }

        return $query->paginate(7);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'user_id'  => 'required|exists:users,id',
            'amount'   => 'required|numeric|min:1',
            'provider' => 'required|string',
        ]);

        $user = User::findOrFail($request->user_id);

        
        $topup = $user->topups()->create([
            'amount'    => $request->amount,
            'provider'  => $request->provider,
            'reference' => 'TX-' . strtoupper(uniqid()),
        ]);

       
        $user->transactions()->create([
            'type'        => 'credit',
            'amount'      => $request->amount,
            'description' => 'Recharge via ' . $request->provider,
        ]);

        
        $wallet = $user->wallet;
        $wallet->balance += $request->amount;
        $wallet->save();

        
        $user->notifications()->create([
            'title'   => 'Recharge réussie',
            'message' => "Votre compte a été rechargé de {$request->amount} FCFA via {$request->provider}",
        ]);

        return response()->json([
            'message'      => 'Recharge ajoutée avec succès',
            'topup'        => $topup,
            'new_balance'  => $wallet->balance,
        ]);
    }
}
