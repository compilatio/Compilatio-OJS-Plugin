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
            'bundleDetections' => ['sometimes', 'array'],
            'bundleDetections.*' => ['array'],
            'bundleDetections.*.enabled' => ['required', 'boolean'],
            'thresholds' => ['required', 'array'],
            'thresholds.warning' => ['required', 'integer', 'min:0', 'max:100'],
            'thresholds.critical' => [
                'required',
                'integer',
                'min:0',
                'max:100',
                'gte:thresholds.warning',
            ],
            'scheduledAnalysisAt' => [
                'nullable',
                'required_if:analysisLaunchMode,scheduled',
                'date',
                'after:now',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'thresholds.critical.gte' =>
                'The critical threshold must be greater than or equal to the warning threshold.',
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
