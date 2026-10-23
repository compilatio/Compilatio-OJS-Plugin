import { type IconName } from '@elastisafe/components'

export interface DetectionConfiguration {
  process: string
  iconName: IconName
  enabled: boolean
  configurable: boolean
}

export interface MarketingNotification {
  id: string
  date: string
  title: string
  body: string
}

export interface AssetProcessorSettings {
  auto_analysis: boolean
  time_analysis: string
  default_indexing: boolean
  student_report_enabled: boolean
  student_report: 'certificate' | 'detailed'
  warning_threshold: number
  critical_threshold: number
  detections: Record<string, { enabled: boolean; configurable: boolean }>
}

export interface ConfigurationForm {
  action: string
  launchId: string
  csrf: string
  clientId: string
  mode: string
}

export interface ConfigurationState {
  autoAnalysis: string
  timeAnalysis: string
  defaultIndexing: boolean
  studentReport: 'certificate' | 'detailed'
  studentReportEnabled: boolean
  warningThreshold: number
  criticalThreshold: number
}

export interface SettingsBootstrap {
  platform: string
  mode: string
  logoUrl: string
  allowedFileTypes: string[]
  locale: string
  translations: Record<string, string>
  settings: AssetProcessorSettings
  detections: DetectionConfiguration[]
  alerts: string[]
  marketingNotifications: MarketingNotification[]
  form: ConfigurationForm
}
