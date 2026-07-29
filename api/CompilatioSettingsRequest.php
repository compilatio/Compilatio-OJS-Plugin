<?php

namespace APP\plugins\generic\compilatio\api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompilatioSettingsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'apiKey' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'automaticIndexingEnabled' => ['required', 'boolean'],
            'analysisLaunchMode' => [
                'required',
                'string',
                Rule::in(['automatic', 'manual', 'scheduled']),
            ],
            'scheduledAnalysisAt' => [
                'nullable',
                'required_if:analysisLaunchMode,scheduled',
                'date',
                'after:now',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('apiKey')) {
            $this->merge([
                'apiKey' => trim((string) $this->input('apiKey')),
            ]);
        }
    }
}
