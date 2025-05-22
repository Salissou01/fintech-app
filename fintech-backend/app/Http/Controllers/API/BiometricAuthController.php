<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Aws\Textract\TextractClient;
use Aws\Rekognition\RekognitionClient;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Carbon\Carbon;

class BiometricAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email'     => 'required|email|unique:users',
            'phone'     => 'required|string',
            'photo_id'  => 'required|image',
            'selfie'    => 'required|image',
        ]);

        // 1. Enregistrement des fichiers
        $photoIdPath = $request->file('photo_id')->store('biometric');
        $selfieFile = $request->file('selfie');
        $selfiePath = $selfieFile->store('public/photos');

        // 2. OCR avec Textract
        $textract = new TextractClient([
            'region' => env('AWS_DEFAULT_REGION'),
            'version' => 'latest',
            'credentials' => [
                'key'    => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);

        $result = $textract->analyzeDocument([
            'Document' => ['Bytes' => Storage::get($photoIdPath)],
            'FeatureTypes' => ['FORMS'],
        ]);

        $lines = [];
        foreach ($result['Blocks'] as $block) {
            if ($block['BlockType'] === 'LINE') {
                $lines[] = trim($block['Text']);
            }
        }

        // 3. Extraction fiable via patterns
        $nom = null;
        $prenom = null;
        $dateNaissance = null;
        $identityNumber = null;

        foreach ($lines as $line) {
            // NOM : 2 mots majuscules
            if (!$nom && preg_match('/^[A-Z\s]{4,}$/', $line) && str_word_count($line) >= 2) {
                $nom = $line;
            }

            // PRÉNOM : 1 mot majuscule, éviter faux positifs
            if (!$prenom && preg_match('/^[A-Z]{3,}$/', $line)) {
                if (!in_array($line, ['NER', 'DGP', 'DST', 'M', 'F'])) {
                    $prenom = $line;
                }
            }

            // DATE DE NAISSANCE
            if (!$dateNaissance && preg_match('/\d{2}\.\d{2}\.\d{4}/', $line, $match)) {
                try {
                    $dateNaissance = Carbon::createFromFormat('d.m.Y', $match[0])->format('Y-m-d');
                } catch (\Exception $e) {
                    $dateNaissance = null;
                }
            }

            // N° PIÈCE
            if (!$identityNumber && preg_match('/\d{2}PC\d{5,}/', $line, $match)) {
                $identityNumber = $match[0];
            }
        }

        // 4. Vérification faciale
        $rekognition = new RekognitionClient([
            'region' => env('AWS_DEFAULT_REGION'),
            'version' => 'latest',
            'credentials' => [
                'key'    => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);

        $faceResult = $rekognition->compareFaces([
            'SourceImage' => ['Bytes' => Storage::get($photoIdPath)],
            'TargetImage' => ['Bytes' => file_get_contents($selfieFile)],
            'SimilarityThreshold' => 85,
        ]);

        if (!empty($faceResult['FaceMatches']) && $faceResult['FaceMatches'][0]['Similarity'] > 85) {
            $user = User::create([
                'email'            => $request->email,
                'phone'            => $request->phone, // 🔄 passé via formulaire
                'nom'              => $nom,
                'prenom'           => $prenom,
                'date_naissance'   => $dateNaissance,
                'identity_number'  => $identityNumber,
                'photo'            => Storage::url($selfiePath),
            ]);

            $user->wallet()->create([
                'balance'     => 0,
                'card_number' => '4242-' . rand(1000, 9999) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999),
            ]);

            $token = $user->createToken('biometric')->plainTextToken;

            return response()->json([
                'message' => 'Inscription réussie',
                'token'   => $token,
                'user'    => [
                    'nom'              => $user->nom,
                    'prenom'           => $user->prenom,
                    'date_naissance'   => $user->date_naissance,
                    'identity_number'  => $user->identity_number,
                    'email'            => $user->email,
                    'phone'            => $user->phone,
                    'photo'            => $user->photo,
                    'solde'            => number_format($user->wallet->balance, 2),
                ]
            ]);
        }

        return response()->json(['error' => 'Reconnaissance faciale échouée'], 422);
    }
    
    public function login(Request $request)
{
    $request->validate([
        'photo_id' => 'required|image',
        'selfie'   => 'required|image',
    ]);

    // 1. Sauvegarder temporairement les fichiers
    $photoIdPath = $request->file('photo_id')->store('biometric/login');
    $selfieFile = $request->file('selfie');

    // 2. Extraire identity_number avec Textract
    $textract = new TextractClient([
        'region' => env('AWS_DEFAULT_REGION'),
        'version' => 'latest',
        'credentials' => [
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
        ],
    ]);

    $result = $textract->analyzeDocument([
        'Document' => ['Bytes' => Storage::get($photoIdPath)],
        'FeatureTypes' => ['FORMS'],
    ]);

    $lines = [];
    foreach ($result['Blocks'] as $block) {
        if ($block['BlockType'] === 'LINE') {
            $lines[] = trim($block['Text']);
        }
    }

    $identityNumber = null;
    foreach ($lines as $line) {
        if (preg_match('/\d{2}PC\d{5,}/', $line, $match)) {
            $identityNumber = $match[0];
            break;
        }
    }

    if (!$identityNumber) {
        return response()->json(['error' => 'Numéro d’identification introuvable sur la pièce.'], 422);
    }

    // 3. Vérifier si un utilisateur correspond
    $user = User::where('identity_number', $identityNumber)->first();

    if (!$user) {
        return response()->json(['error' => 'Aucun utilisateur trouvé avec ce numéro d’identification.'], 404);
    }

    // 4. Vérification faciale avec Rekognition
    $rekognition = new RekognitionClient([
        'region' => env('AWS_DEFAULT_REGION'),
        'version' => 'latest',
        'credentials' => [
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
        ],
    ]);

    $faceResult = $rekognition->compareFaces([
        'SourceImage' => ['Bytes' => Storage::get($photoIdPath)],
        'TargetImage' => ['Bytes' => file_get_contents($selfieFile)],
        'SimilarityThreshold' => 85,
    ]);

    if (empty($faceResult['FaceMatches']) || $faceResult['FaceMatches'][0]['Similarity'] < 85) {
        return response()->json(['error' => 'Échec de la reconnaissance faciale.'], 422);
    }

    // 5. Succès : générer token et retourner info
    $token = $user->createToken('biometric_login')->plainTextToken;

    return response()->json([
        'message' => 'Connexion réussie',
        'token'   => $token,
        'user'    => [
            'nom'              => $user->nom,
            'prenom'           => $user->prenom,
            'date_naissance'   => $user->date_naissance,
            'identity_number'  => $user->identity_number,
            'email'            => $user->email,
            'phone'            => $user->phone,
            'photo'            => $user->photo,
            'solde'            => number_format($user->wallet->balance, 2),
        ]
    ]);
}

}
