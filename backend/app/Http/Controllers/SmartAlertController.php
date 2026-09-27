<?php

namespace App\Http\Controllers;

use App\Exceptions\LocationNotFoundException;
use App\Models\Alert;
use App\Services\ResponseService;
use App\Services\SmartAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class SmartAlertController extends Controller
{
    public function index(Request $request)
    {
        $alerts = Alert::where('user_id', $request->user()->user_id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return ResponseService::allItemsResponse([
            'alerts' => $alerts,
            'unread_count' => $alerts->where('is_read', false)->count(),
        ]);
    }

    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'sometimes|nullable|string|max:120',
        ]);

        if ($validator->fails()) {
            return ResponseService::faliedValidationResponse($validator);
        }

        try {
            $alerts = SmartAlertService::generateForUser($request->user(), $request->input('city'));
        } catch (LocationNotFoundException $e) {
            return response()->json([
                'status' => 422,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Smart alert generation failed: '.$e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Could not generate alerts right now. Please try again later.',
            ], 500);
        }

        return ResponseService::allItemsResponse($alerts);
    }

    public function markRead(Request $request, $id)
    {
        $alert = Alert::where('user_id', $request->user()->user_id)->find($id);

        if (!$alert) {
            return ResponseService::itemNotFoundResponse('Alert', $id);
        }

        $alert->update(['is_read' => true]);

        return ResponseService::singleItemsResponse($alert);
    }

    public function markAllRead(Request $request)
    {
        Alert::where('user_id', $request->user()->user_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return ResponseService::allItemsResponse([]);
    }
}
