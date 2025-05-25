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
            'receiver_phone' => 'required|string|exists:users,phone',
            'amount'         => 'required|numeric|min:1',
            'note'           => 'nullable|string',
        ]);

        $sender = $request->user();
        $receiver = User::where('phone', $request->receiver_phone)->first();

        if ($receiver->id === $sender->id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous transférer à vous-même'], 400);
        }

        $amount = $request->amount;

        // Vérifier solde suffisant
        if ($sender->wallet->balance < $amount) {
            return response()->json(['message' => 'Solde insuffisant'], 400);
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

        // Ajouter transaction débit pour l'expéditeur
        $sender->transactions()->create([
            'type'        => 'debit',
            'amount'      => $amount,
            'description' => 'Transfert vers ' . $receiver->prenom . ' (' . $receiver->phone . ')'
        ]);

        // Ajouter transaction crédit pour le destinataire
        $receiver->transactions()->create([
            'type'        => 'credit',
            'amount'      => $amount,
            'description' => 'Transfert reçu de ' . $sender->prenom . ' (' . $sender->phone . ')'
        ]);

        // Ajouter notification à l'expéditeur
        $sender->notifications()->create([
            'title'   => 'Transfert effectué',
            'message' => "Vous avez envoyé {$amount} FCFA à {$receiver->prenom} ({$receiver->phone})"
        ]);

        // Ajouter notification au destinataire
        $receiver->notifications()->create([
            'title'   => 'Virement reçu',
            'message' => "Vous avez reçu {$amount} FCFA de {$sender->prenom} ({$sender->phone})"
        ]);

        return response()->json([
            'message'  => 'Transfert réussi',
            'transfer' => $transfer
        ]);
    }
}
