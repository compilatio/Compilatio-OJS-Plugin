<?php

// namespace APP\plugins\generic\compilatio\migration;

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// final class CompilatioSchemaMigration extends Migration
// {
//     public function up(): void
//     {
//         if (Schema::hasTable('compilatio_user')) {
//             return;
//         }

//         Schema::create('compilatio_user', function (Blueprint $table): void {
//             $table->bigInteger('user_id');
//             $table->string('compilatio_user_id', 255);

//             $table->primary('user_id', 'compilatio_user_pkey');
//             $table->unique('compilatio_user_id', 'compilatio_user_compilatio_id_unique');
//             $table->foreign('user_id', 'compilatio_user_user_id_foreign')
//                 ->references('user_id')
//                 ->on('users')
//                 ->onDelete('cascade');
//         });
//     }

//     public function down(): void
//     {
//         Schema::dropIfExists('compilatio_user');
//     }
// }
