<?php

namespace APP\plugins\generic\compilatio\migration;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

final class CompilatioSchemaMigration extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('compilatio_documents')) {
            $this->upgradeExistingDocumentsTable();
            return;
        }

        Schema::create('compilatio_documents', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->bigInteger('context_id');
            $table->bigInteger('submission_id');
            $table->bigInteger('submission_file_id');
            $table->bigInteger('file_id');
            $table->bigInteger('uploader_user_id');
            $table->string('folder_id', 255);
            $table->string('filename', 255);
            $table->text('title');
            $table->text('description')->nullable();
            $table->string('external_id', 255)->nullable();
            $table->string('status', 64)->nullable();
            $table->text('error_message')->nullable();
            $table->string('analysis_id', 255)->nullable();
            $table->longText('light_reports')->nullable();
            $table->boolean('indexed')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->unique('submission_file_id', 'compilatio_documents_submission_file_unique');
            $table->index('context_id', 'compilatio_documents_context_id');
            $table->index('submission_id', 'compilatio_documents_submission_id');
            $table->index('external_id', 'compilatio_documents_external_id');
            $table->index('status', 'compilatio_documents_status');
        });
    }

    private function upgradeExistingDocumentsTable(): void
    {
        if (!Schema::hasColumn('compilatio_documents', 'title')) {
            Schema::table('compilatio_documents', function (Blueprint $table): void {
                $table->text('title')->nullable();
            });
        }

        if (!Schema::hasColumn('compilatio_documents', 'description')) {
            Schema::table('compilatio_documents', function (Blueprint $table): void {
                $table->text('description')->nullable();
            });
        }

        if (!Schema::hasColumn('compilatio_documents', 'light_reports')) {
            Schema::table('compilatio_documents', function (Blueprint $table): void {
                $table->longText('light_reports')->nullable();
            });
        }

        $obsoleteColumns = array_values(array_filter(
            [
                'global_score',
                'similarity_score',
                'similarity_quotation_score',
                'ai_score',
                'ignored_scores',
            ],
            static fn (string $column): bool =>
                Schema::hasColumn('compilatio_documents', $column)
        ));

        if ($obsoleteColumns !== []) {
            Schema::table(
                'compilatio_documents',
                static function (Blueprint $table) use ($obsoleteColumns): void {
                    $table->dropColumn($obsoleteColumns);
                }
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('compilatio_documents');
    }
}
