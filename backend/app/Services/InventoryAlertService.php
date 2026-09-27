<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\User;

class InventoryAlertService
{
    private const LOW_STOCK_THRESHOLD = 5;

    // The inventory-side counterpart to SmartAlertService's weather alerts:
    // looks at this engineer's own storefront and raises one alert when items
    // are out of stock, or when items are running low - built the same way,
    // a small rule engine over real data, phrased by Gemini when available.
    public static function generateForUser(User $user): array
    {
        $products = $user->relatedUserProducts()
            ->with('product')
            ->get()
            ->pluck('product')
            ->filter();

        $facts = self::buildFacts($products);

        $alerts = [];

        foreach ($facts as $fact) {
            $alerts[] = Alert::create([
                'user_id' => $user->user_id,
                'type' => $fact['type'],
                'severity' => $fact['severity'],
                'title' => $fact['title'],
                'message' => self::phraseMessage($fact),
                'city' => null,
                'is_read' => false,
            ]);
        }

        return $alerts;
    }

    private static function buildFacts($products): array
    {
        $outOfStock = $products
            ->filter(fn ($product) => (int) $product->stock_quantity <= 0)
            ->values();

        if ($outOfStock->isNotEmpty()) {
            return [[
                'type' => 'inventory',
                'severity' => 'critical',
                'title' => 'Out of stock',
                'items' => $outOfStock->pluck('name')->all(),
            ]];
        }

        $lowStock = $products
            ->filter(fn ($product) => (int) $product->stock_quantity <= self::LOW_STOCK_THRESHOLD)
            ->values();

        if ($lowStock->isNotEmpty()) {
            return [[
                'type' => 'inventory',
                'severity' => 'warning',
                'title' => 'Low stock',
                'items' => $lowStock->pluck('name')->all(),
                'threshold' => self::LOW_STOCK_THRESHOLD,
            ]];
        }

        return [];
    }

    private static function phraseMessage(array $fact): string
    {
        $template = self::templateMessage($fact);

        $prompt = "You are an inventory assistant writing a short alert for an agricultural products/equipment dealer. "
            ."Given these facts as JSON, write ONE short, friendly, actionable sentence (max 220 characters). "
            ."Respond with only the sentence, no quotes and no markdown.\n"
            .json_encode($fact);

        return GeminiTextService::phraseSentence($prompt, $template);
    }

    private static function templateMessage(array $fact): string
    {
        $items = implode(', ', $fact['items']);

        if ($fact['title'] === 'Out of stock') {
            return "You're out of stock on: {$items}. Restock soon to avoid missing sales.";
        }

        return "Running low (at or under {$fact['threshold']} left) on: {$items}. Consider restocking soon.";
    }
}
