<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class AdminNotificationController extends Controller
{
    
    public function index(Request $request)
    {
        $notifications = Notification::with('user') 
            ->orderByDesc('created_at')
            ->paginate(7); 

        return response()->json($notifications);
    }

    
    public function markAsRead($id)
    {
        $notification = Notification::find($id);
        if (! $notification) {
            return response()->json(['message' => 'Notification introuvable'], 404);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }
}
