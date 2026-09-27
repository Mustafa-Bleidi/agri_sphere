<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $primaryKey = 'alert_id';

    protected $fillable = [
        'user_id',
        'type',
        'severity',
        'title',
        'message',
        'city',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user() : BelongsTo
    {//                                     foreign key  local key
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
