<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Aws\Textract\TextractClient;
use Aws\Rekognition\RekognitionClient;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminUserController extends Controller
{
    
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('identity_number', 'like', "%$search%");
            });
        }

        $users = $query->select('id','identity_number', 'nom', 'prenom', 'date_naissance', 'email', 'phone', 'created_at')
                       ->orderByDesc('created_at')
                       ->paginate(10);

        return response()->json($users);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'email'     => 'required|email|unique:users',
            'phone'     => 'required|string',
            'photo_id'  => 'required|image',
            'selfie'    => 'required|image',
        ]);

        
        $photoIdPath = $request->file('photo_id')->store('biometric/admin');
        $selfieFile = $request->file('selfie');

        
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

        $nom = null; $prenom = null; $dateNaissance = null; $identityNumber = null;
        foreach ($lines as $line) {
            if (!$nom && preg_match('/^[A-Z\s]{4,}$/', $line) && str_word_count($line) >= 2) {
                $nom = $line;
            }
            if (!$prenom && preg_match('/^[A-Z]{3,}$/', $line) && !in_array($line, ['NER', 'DGP', 'DST', 'M', 'F'])) {
                $prenom = $line;
            }
            if (!$dateNaissance && preg_match('/\d{2}\.\d{2}\.\d{4}/', $line, $match)) {
                $dateNaissance = Carbon::createFromFormat('d.m.Y', $match[0])->format('Y-m-d');
            }
            if (!$identityNumber && preg_match('/\d{2}PC\d{5,}/', $line, $match)) {
                $identityNumber = $match[0];
            }
        }

       
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

        if (empty($faceResult['FaceMatches']) || $faceResult['FaceMatches'][0]['Similarity'] < 85) {
            return response()->json(['error' => 'Échec de la reconnaissance faciale.'], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'phone' => $request->phone,
            'nom' => $nom,
            'prenom' => $prenom,
            'date_naissance' => $dateNaissance,
            'identity_number' => $identityNumber,
            'photo' => Storage::url($selfieFile->store('public/photos')),
        ]);

        $user->wallet()->create([
            'balance' => 0,
            'card_number' => '4242-' . rand(1000,9999) . '-' . rand(1000,9999) . '-' . rand(1000,9999),
        ]);

        return response()->json(['message' => 'Utilisateur ajouté', 'user' => $user]);
    }



}
