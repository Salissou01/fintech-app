<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\User;

class AdminWalletController extends Controller
{
    // 📄 Liste paginée et recherche
    public function index(Request $request)
    {
        $query = Wallet::with('user')->orderByDesc('created_at');

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('identity_number', 'like', "%$search%")
                  ->orWhere('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%");
            });
        }

        $wallets = $query->paginate(10);

        return response()->json($wallets);
    }
}
