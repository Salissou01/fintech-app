<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();

        $table->string('email')->unique();
        $table->string('phone')->nullable();

        $table->string('nom')->nullable();
        $table->string('prenom')->nullable();
        $table->date('date_naissance')->nullable();
        $table->string('identity_number')->nullable();
        $table->string('photo')->nullable();

        $table->timestamps();
    });
}



    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
