<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Transaction;

class TransferController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'receiver_email' => 'required|email|exists:users,email',
            'amount'         => 'required|numeric|min:1',
            'note'           => 'nullable|string',
        ]);

        $sender = $request->user();
        $receiver = User::where('email', $request->receiver_email)->first();

        if ($receiver->id === $sender->id) {
            return response()->json(['message' => 'You cannot transfer to yourself'], 400);
        }

        $amount = $request->amount;

        // Vérifier solde suffisant
        if ($sender->wallet->balance < $amount) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        // Débiter l'expéditeur
        $sender->wallet->balance -= $amount;
        $sender->wallet->save();

        // Créditer le destinataire
        $receiver->wallet->balance += $amount;
        $receiver->wallet->save();

        // Créer le transfert
        $transfer = Transfer::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'amount'      => $amount,
            'note'        => $request->note
        ]);

        // Ajouter transaction debit pour l'expéditeur
        $sender->transactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'description' => 'Transfert vers ' . $receiver->email
        ]);

        // Ajouter transaction crédit pour le destinataire
        $receiver->transactions()->create([
            'type' => 'credit',
            'amount' => $amount,
            'description' => 'Transfert reçu de ' . $sender->email
        ]);
        // Ajouter notification à l'expéditeur
        $sender->notifications()->create([
            'title' => 'Transfert effectué',
            'message' => "Vous avez envoyé {$amount} FCFA à {$receiver->email}"
        ]);

        // Ajouter notification au destinataire
        $receiver->notifications()->create([
            'title' => 'Virement reçu',
            'message' => "Vous avez reçu {$amount} FCFA de {$sender->email}"
        ]);

        return response()->json([
            'message' => 'Transfer successful',
            'transfer' => $transfer
        ]);
    }
}
