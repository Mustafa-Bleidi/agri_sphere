<?php

namespace App\Services;

use App\Http\Requests\order\purchasedOrder\StorePurchasedOrderRequest;
use App\Http\Requests\order\rentalOrder\StoreRentalOrderRequest;
use App\Http\Requests\order\StoreOrderRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PurchasedOrder;
use App\Models\RentalOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderService
{
    // Define allowed order types in a constant
    private static $allowedOrderTypes = [
        'purchased_order',
        'rental_order',
    ];

    // Define allowed payment status in a constant
    private static $allowedPaymentStatus = [
        'pending',
        'completed',
        'failed',
        'refuneded',
    ];

    // Define allowed order status in a constant
    private static $allowedOrderStatus = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
    ];

    // Define allowed rent status in a constant
    private static $allowedRentStatus = [
        'quote',
        'confirmed',
        'active',
        'completed',
        'cancelled',
        'no_show',
    ];

    // Define allowed pick up status in a constant
    private static $allowedPickupStatus = [
        'pending',
        'customer_present',
        'vehicle_ready',
        'completed',
    ];

    // Define allowed drop off status in a constant
    private static $allowedDropoffStatus = [
        'pending',
        'vehicle_returned',
        'inspection_pending',
        'completed',
    ];

    // This method will return all of the orders
    public static function showAllOrders() {
        $orders = DB::table('users as U')
            ->join('addresses as A', 'U.user_id', '=', 'A.user_id')
            ->join('orders as O', 'U.user_id', '=', 'O.user_id')
            ->join('payments as P', 'O.order_id', '=', 'P.order_id')
            ->select(
                'U.username', 
                'U.email', 
                'U.first_name', 
                'U.last_name', 
                'U.phone_number', 
                'A.*', 
                'O.*', 
                'P.*'
            )
            ->get();

        return $orders;
    }

    // This method will return all of the orders
    public static function showAllUserOrders(string $user_id) {
        $orders = DB::table('orders as O')
            ->join('payments as P', 'O.order_id', '=', 'P.order_id')
            ->leftJoin('purchased_orders as PO', 'O.order_id', '=', 'PO.purchased_order_id')
            ->leftJoin('rental_orders as RO', 'O.order_id', '=', 'RO.rental_order_id')
            ->select(
                'O.*',
                'P.payment_method',
                'P.payment_status',
                'P.amount',
                'P.transaction_id',
                'P.paid_at',
                'PO.order_status',
                'PO.grand_total',
                'RO.rental_status',
                'RO.pickup_status',
                'RO.dropoff_status',
                'RO.total_amount as rental_total_amount'
            )
            ->where('O.user_id', $user_id)
            ->orderBy('O.created_at', 'desc')
            ->get();

        return $orders;
    }

    // This method will return a certain order from DB with specfic ID
    public static function getOrderById(string $id) {
        $order = Order::find($id);

        if ( $order->order_type != null ) {

            if ( $order->order_type == "purchased_order") {
                $order = PurchasedOrder::select(
                        'U.username',
                        'U.email' ,
                        'U.first_name',
                        'U.last_name' ,
                        'U.phone_number',
                        'O.*',
                        'P.*',
                        'purchased_orders.*',
                    )
                    ->join('orders as O', 'O.order_id', '=', 'purchased_orders.purchased_order_id')
                    ->join('payments as P', 'O.order_id', '=', 'P.order_id')
                    ->join('users as U', 'U.user_id', '=', 'O.user_id')
                    ->join('purchased_orders as PO', 'O.order_id', '=', 'PO.purchased_order_id')
                    ->with(['purchasedOrderItems.purchasedProduct.product.productImages', 'shippingAddress', 'billingAddress'])
                    ->find($id);
            }
            else if ( $order->order_type == "rental_order" ) {
                $order = RentalOrder::select(
                    'U.username',
                    'U.email',
                    'U.first_name',
                    'U.last_name',
                    'U.phone_number',
                    'O.*',
                    'P.*',
                    'rental_orders.*',
                )
                ->join('orders as O', 'rental_orders.rental_order_id', '=', 'O.order_id')
                ->join('payments as P', 'O.order_id', '=', 'P.order_id')
                ->join('users as U', 'O.user_id', '=', 'U.user_id')
                ->with(['rentalProduct.product.productImages', 'pickupAddress', 'dropoffAddress'])
                ->find($id);
            }

            return $order;
        }
    }

    // This method will store a single purchased order in DB
    public static function storePurchasedOrder(StorePurchasedOrderRequest $request) {
        $data = $request->validated();

        $purchased_order = OrderService::savePurchasedOrder($request, $data);

        return $purchased_order;
    }

    // This method will store a single rental order in DB
    public static function storeRentalOrder(StoreRentalOrderRequest $request, $rental_product_id) {
        $data = $request->validated();

        $rental_order = OrderService::saveRentalOrder($request, $data, $rental_product_id);

        return $rental_order;
    }

    // This method will update a single order in DB with specific ID
    public static function updateOrder(Request $request, Order $order) {

        if ( $order->order_type ) {

            $payment = Payment::where('order_id', $order->order_id)->first();
            $payment->payment_method = $request->payment_method;
            $payment->payment_status = $request->payment_status;

            if ($request->payment_status == "completed" ) $payment->paid_at = Carbon::now();

            $payment->save();

            if ( $order->order_type == "purchased_order" ) {
                $purchasedOrder = OrderService::editPurchasedOrder($request, $order);

                return $purchasedOrder;
            }
            else if ( $order->order_type == "rental_order" ) {
                $rentalOrder = OrderService::editRentalOrder($request, $order);

                return $rentalOrder;
            }
        }
    }

    // This method will delete a single order in DB
    public static function deleteOrderById(string $id) {
        $order = Order::find($id);

        if ( $order == null ) return null;

        $order->delete();

        return $order;
    }

    // This method will validate the requirment for store purchased order
    public static function validateStoreOrder($request) {
        $purchasedOrderStoreRules = [
            'order_type' => 'required|string|in:'.implode(',', OrderService::$allowedOrderTypes),
            'discount_amount' => 'nullable|numeric',
            'cancelled_at' => 'nullable|string',
            'cancellation_reason' => 'nullable|string',

        ];

        $validator = Validator::make($request->all(), $purchasedOrderStoreRules);

        return $validator;
    }

    // This method will validate the requirment for update purchased order
    public static function validateUpdatePurchasedOrder($request) {

        $purchasedOrderUpdateRules = [
            'order_type' => 'required|string|in:purchased_order',
            'payment_method' => 'required|string',
            'payment_status' => 'required|string|in:'.implode(',', OrderService::$allowedPaymentStatus),
            'order_status' => 'required|string|in:'.implode(',', OrderService::$allowedOrderStatus),
        ];

        $validator = Validator::make($request->all(), $purchasedOrderUpdateRules);

        return $validator;
    }

    // This method will validate the requirment for update rental order
    public static function validateUpdateRentalOrder($request) {

        $rentalOrderUpdateRules = [
            'order_type' => 'required|string|in:rental_order',
            'payment_method' => 'required|string',
            'payment_status' => 'required|string|in:'.implode(',', OrderService::$allowedPaymentStatus),
            'rental_status' => 'required|string|in:'.implode(',', OrderService::$allowedRentStatus),
            'pickup_status' => 'required|string|in:'.implode(',', OrderService::$allowedPickupStatus),
            'dropoff_status' => 'required|string|in:'.implode(',', OrderService::$allowedDropoffStatus),
        ];

        $validator = Validator::make($request->all(), $rentalOrderUpdateRules);

        return $validator;
    }


    // ========================= Private Static Methods =========================

    private static function saveOrder($request, $data) {
        $order = new Order();

        $order->user_id = $request->user()->user_id;
        $order->order_type = $data["order_type"];
        $order->order_date = Carbon::now();
        $order->discount_amount = $request->discount_amount;
        $order->cancelled_at = $request->cancelled_at;
        $order->cancellation_reason = $request->cancellation_reason;

        $order->save();

        return $order;
    }

    private static function savePurchasedOrder(StorePurchasedOrderRequest $request, $data) {
        $order = OrderService::saveOrder($request, $data);

        $purchased_order = new PurchasedOrder();

        $purchased_order->purchased_order_id = $order->order_id;

        $purchased_order->order_type = "purchased_order";
        $purchased_order->subtotal = $data["subtotal"];
        $purchased_order->grand_total = $data["grand_total"];
        $purchased_order->order_status = $data["order_status"];
        $purchased_order->required_date = $order->required_date;
        $purchased_order->shipped_date = $order->shipped_date;
        $purchased_order->shipping_fee = $data["shipping_fee"];

        return $purchased_order;
    }

    private static function saveRentalOrder(StoreRentalOrderRequest $request, $data, $rental_product_id) {
        $order = OrderService::saveOrder($request, $data);
        
        $rental_order = new RentalOrder();

        $rental_order->rental_order_id = $order->order_id;
        $rental_order->rental_product_id = $rental_product_id;

        $rental_order->order_type = "rental_order";
        $rental_order->actual_pickup_date = $request->actual_pickup_date;
        $rental_order->actual_dropoff_date = $request->actual_dropoff_date;
        $rental_order->rental_status = $data["rental_status"];
        $rental_order->pickup_status = $data["pickup_status"];
        $rental_order->dropoff_status = $data["dropoff_status"];
        $rental_order->base_rental_amount = $data["base_rental_amount"];
        $rental_order->tax_amount = $data["tax_amount"];
        $rental_order->total_amount = $data["total_amount"];
        $rental_order->refund_amount = $data["refund_amount"];

        return $rental_order;
    }

    private static function editPurchasedOrder($request, $order) {
        $purchasedOrder = PurchasedOrder::find($order->order_id);

        $purchasedOrder->order_status = $request->order_status;

        $purchasedOrder->save();

        $purchasedOrder = PurchasedOrder::select(
                'U.username',
                'U.email',
                'U.first_name',
                'U.last_name',
                'U.phone_number',
                'O.*',
                'P.*',
                'purchased_orders.*',
            )
            ->join('orders as O', 'purchased_orders.purchased_order_id', '=', 'O.order_id')
            ->join('payments as P', 'O.order_id', '=', 'P.order_id')
            ->join('users as U', 'O.user_id', '=', 'U.user_id')
            ->find($order->order_id);

        return $purchasedOrder;
    }

    private static function editRentalOrder($request, $order) {
        $rentalOrder = RentalOrder::find($order->order_id);

        $rentalOrder->rental_status = $request->rental_status;
        $rentalOrder->pickup_status = $request->pickup_status;
        $rentalOrder->dropoff_status = $request->dropoff_status;

        $rentalOrder->save();

        $rentalOrder = RentalOrder::select(
                'U.username',
                'U.email',
                'U.first_name',
                'U.last_name',
                'U.phone_number',
                'O.*',
                'P.*',
                'rental_orders.*',
            )
            ->join('orders as O', 'rental_orders.rental_order_id', '=', 'O.order_id')
            ->join('payments as P', 'O.order_id', '=', 'P.order_id')
            ->join('users as U', 'O.user_id', '=', 'U.user_id')
            ->find($order->order_id);

        return $rentalOrder;
    }
}
