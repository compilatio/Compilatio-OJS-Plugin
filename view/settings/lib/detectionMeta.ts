import { type IconName } from '@elastisafe/components'

const detectionIcons: Record<string, IconName> = {
  similarity: 'paste-regular',
  ai_detection: 'ai-generated',
  unrecognized_text_language: 'same-meaning',
  spellchecker: 'spell-check',
  rewording: 'rewording',
}

export function detectionLabelKey(process: string): string {
  return `detection_${process}_title`
}

export function detectionDescriptionKey(process: string): string {
  return `detection_${process}_description`
}

export function detectionIcon(process: string): IconName {
  return detectionIcons[process] ?? 'triangle-exclamation-regular'
}

