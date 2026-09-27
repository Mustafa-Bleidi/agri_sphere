<?php

namespace App\Http\Controllers;

use App\Services\PlantDiagnosisService;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class PlantDiagnosisController extends Controller
{
    public function diagnose(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:8192',
        ]);

        if ($validator->fails()) {
            return ResponseService::faliedValidationResponse($validator);
        }

        try {
            $diagnosis = PlantDiagnosisService::diagnose($request->file('image'));
        } catch (Throwable $e) {
            Log::error('Plant diagnosis failed: '.$e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Could not analyze the image right now. Please try again later.',
            ], 500);
        }

        return ResponseService::allItemsResponse($diagnosis);
    }
}
