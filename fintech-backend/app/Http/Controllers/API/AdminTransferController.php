<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;

class AdminTransferController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Transfer::with(['sender', 'receiver'])->orderByDesc('created_at');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('sender', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%");
            })->orWhereHas('receiver', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%");
            });
        }

        return $query->paginate(10);
    }

   
    public function store(Request $request)
    {
        $request->validate([
            'sender_id'   => 'required|exists:users,id',
            'receiver_id' => 'required|exists:users,id|different:sender_id',
            'amount'      => 'required|numeric|min:1',
            'note'        => 'nullable|string',
        ]);

        $sender = User::findOrFail($request->sender_id);
        $receiver = User::findOrFail($request->receiver_id);

        if ($sender->wallet->balance < $request->amount) {
            return response()->json(['message' => 'Solde insuffisant du sender.'], 400);
        }

      
        $sender->wallet->balance -= $request->amount;
        $sender->wallet->save();

       
        $receiver->wallet->balance += $request->amount;
        $receiver->wallet->save();

        
        $transfer = Transfer::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'amount'      => $request->amount,
            'note'        => $request->note,
        ]);

        
        $sender->transactions()->create([
            'type' => 'debit',
            'amount' => $request->amount,
            'description' => 'Transfert vers ' . $receiver->prenom . ' (' . $receiver->phone . ')'
        ]);

        $receiver->transactions()->create([
            'type' => 'credit',
            'amount' => $request->amount,
            'description' => 'Transfert reçu de ' . $sender->prenom . ' (' . $sender->phone . ')'
        ]);

        $sender->notifications()->create([
            'title' => 'Transfert effectué',
            'message' => "Vous avez envoyé {$request->amount} FCFA à {$receiver->prenom} ({$receiver->phone})"
        ]);

        $receiver->notifications()->create([
            'title' => 'Virement reçu',
            'message' => "Vous avez reçu {$request->amount} FCFA de {$sender->prenom} ({$sender->phone})"
        ]);

        return response()->json([
            'message' => 'Transfert ajouté avec succès',
            'transfer' => $transfer
        ]);
    }
}
