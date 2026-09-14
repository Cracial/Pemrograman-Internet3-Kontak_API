<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactPhone extends Model
{
    use HasFactory;

    protected $table = 'kontak_phones';

    protected $fillable = [
        'kontak_id',
        'jenis',
        'nomor_telepon',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'kontak_id');
    }
}