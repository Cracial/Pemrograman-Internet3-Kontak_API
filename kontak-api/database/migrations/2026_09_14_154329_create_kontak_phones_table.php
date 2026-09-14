<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kontak_phones', function (Blueprint $table) {
            $table->id();

            $table->foreignId('kontak_id')
                ->constrained('kontak')
                ->cascadeOnDelete();

            $table->string('jenis', 50);
            $table->string('nomor_telepon', 30);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kontak_phones');
    }
};