<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Topup;
use App\Models\Transfer;
use App\Models\Notification;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $userCount = User::count();
        $topupCount = Topup::count();
        $topupAmount = Topup::sum('amount');
        $transferCount = Transfer::count();
        $notificationCount = Notification::count();

        return response()->json([
            'userCount'         => $userCount,
            'topupCount'        => $topupCount,
            'topupAmount'       => $topupAmount,
            'transferCount'     => $transferCount,
            'notificationCount' => $notificationCount,
        ]);
    }
}
