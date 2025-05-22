<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
        ]);

        // ✅ Création du wallet automatiquement
        $user->wallet()->create([
            'balance'     => 0,
            'card_number' => $this->generateCardNumber()
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user'    => $user->load('wallet'), // on renvoie le wallet aussi
        ]);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('wallet'), // on renvoie aussi le wallet ici
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    // 🔐 Génère un numéro de carte virtuelle fictif
    private function generateCardNumber()
    {
        return '4242-' . rand(1000, 9999) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999);
    }
}
