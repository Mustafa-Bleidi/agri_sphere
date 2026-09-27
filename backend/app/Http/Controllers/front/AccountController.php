<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Http\Requests\user\StoreUserRequest;
use App\Models\Order;
use App\Models\User;
use App\Models\UserImage;
use App\Services\AddressService;
use App\Services\OrderService;
use App\Services\ResponseService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AccountController extends Controller
{
    public function register(StoreUserRequest $request) {
        DB::transaction(function () use ($request) {
            $user = UserService::storeUser($request);

            if ( $request->role == 'farmer' ) {
                $user->syncRoles('farmer');
            } else if ( $request->role == 'engineer' ) {
                $user->syncRoles('engineer');
            } else if ( $request->role == 'dealer' ) {
                $user->syncRoles('dealer');
            } else {
                $user->syncRoles('farmer');
            }
        });

        return response()->json([
            'status' => 200,
            'message' => "You have registered successfully",
        ], 200);
    }

    public function authenticate(Request $request) {
        $validator = Validator::make($request -> all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ( $validator->fails() ) {
            return response()-> json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        if ( Auth::attempt(['email' => $request->email, 'password' => $request->password]) ) {

            // $user = User::find(Auth::user()->user_id);
            
            // Get the authenticated user directly from Auth
            $user = Auth::user();

            if ( !$user ) {
                return response()->json([
                    'status' => 500,
                    'message' => "Authenticated failed after attempt",
                ], 500);
            }

            $token = $user->createToken('token')->plainTextToken;

            return response()-> json([
                'status' => 200,
                'token' => $token,
                'id' => $user->user_id,
                'name' => $user->username,
                'roles' => $user->roles,
            ], 200);
            
        } else {
            return response()-> json([
                'status' => 401,
                'message' => 'Either email/password is incorrect.'
            ], 401);
        }
    }

    public function getOrders(Request $request) {
        $orders = OrderService::showAllUserOrders(Auth::user()->user_id);

        return ResponseService::allItemsResponse($orders);
    }

    public function getOrderDetails(string $id) {
        $order = Order::find($id);

        if ( $order == null ) return ResponseService::itemNotFoundResponse("Order", $id);

        $order = OrderService::getOrderById($id);

        return ResponseService::singleItemsResponse($order);
    }

    public function updateProfile(Request $request) {
        $userId = Auth::user()->user_id;
        $user = User::find($userId);

        if ( $user == null ) return ResponseService::itemNotFoundResponse("User", $userId);

        $validator = UserService::validateUpdateUser($request);

        if ( $validator->fails() ) return ResponseService::faliedValidationResponse($validator);

        $validator = AddressService::validateUpdateAddress($request, ["user_address"]);

        if ( $validator->fails() ) return ResponseService::faliedValidationResponse($validator);

        $user = UserService::updateUserInfo($request);

        AddressService::storeUserAddress($request);

        $user = UserService::userInfo($request);

        return ResponseService::successUpdateItemResponse("User", $userId, $user);
    }

    public function getAccountDetails(Request $request) {
        $userId = $request->user()->user_id;
        $user = User::find($userId);

        if ( $user == null ) return ResponseService::itemNotFoundResponse("User", $userId);

        $user = UserService::userInfo($request);

        return ResponseService::singleItemsResponse($user);
    }

    // This method will store user image in DB and Server
    public function saveUserImage(Request $request) {
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif',
        ]);

        if ( $validator->fails() ) return ResponseService::faliedValidationResponse($validator);


        $image = $request->file('image');
        $imageName = $request->user()->user_id.'-'.time().'.'.$image->extension(); // 17-23224242.jpg

        // Large Thumbnail
        
        $manager = new ImageManager(Driver::class);
        $img = $manager->read($image->getPathName());
        $img->scaleDown(1200);
        $img->save(public_path('uploads/users/large/'.$imageName));

        // Small Thumbnail
        $manager = new ImageManager(Driver::class);
        $img = $manager->read($image->getPathName());
        $img->coverDown(400, 460);
        $img->save(public_path('uploads/users/small/'.$imageName));

        // Insert a record in user_images table
        $userImage = new UserImage();
        $userImage->image = $imageName;
        $userImage->user_id = $request->user()->user_id;
        $userImage->save();

        $user = User::find($request->user()->user_id);
        $user->image = $imageName;
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'Image has been uploaded successfully',
            'data' => $userImage,
        ], 200);
    }

    // This method will update default user image
    public function updateDefaultUserImage(Request $request) {
        $user = User::find($request->user()->user_id);

        if ( $user == null ) return ResponseService::itemNotFoundResponse("User", $request->user()->user_id);

        $user->image = $request->image;
        $user->save();

        return response()->json([
            'status' => 200,
            'message' => 'product default image changed successfully',
        ], 200);
    }
}
