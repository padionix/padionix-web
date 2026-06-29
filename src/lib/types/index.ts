// Padionix Shared Types — ponytail: flat, no inheritance

export type Role = 'farmer' | 'group' | 'dinas' | 'admin'
export type Subscription = 'free' | 'pro' | 'enterprise'
export type DeviceStatus = 'online' | 'offline' | 'error'
export type PestType = 'hama' | 'penyakit' | 'normal' | 'unknown'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type DetectionStatus = 'unhandled' | 'in_progress' | 'resolved' | 'false_positive'
export type AlertType = 'pest_detected' | 'high_temperature' | 'high_humidity' | 'device_offline' | 'low_battery'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Profile {
  id: string; full_name: string; phone?: string; role: Role
  group_name?: string; address?: string; avatar_url?: string
  subscription: Subscription; created_at: string; updated_at: string
  deleted_at?: string
}

export interface Device {
  id: string; user_id: string; name: string; description?: string
  device_key: string; latitude?: number; longitude?: number
  location_name?: string; status: DeviceStatus; battery_pct?: number
  last_seen?: string; is_active: boolean; firmware_ver?: string
  created_at: string; updated_at: string
}

export interface SensorReading {
  id: number; device_id: string; temperature?: number; humidity?: number
  pressure?: number; motion_detected: boolean; signal_strength?: number
  recorded_at: string
}

export interface Detection {
  id: string; device_id: string; image_path: string; pest_name?: string
  pest_type: PestType; confidence?: number; severity?: Severity
  bbox_data?: unknown; ai_raw_result?: unknown; status: DetectionStatus
  handler_note?: string; handled_at?: string; handled_by?: string
  detected_at: string
}

export interface Alert {
  id: string; user_id: string; device_id?: string; detection_id?: string
  type: AlertType; severity: AlertSeverity; title: string; message: string
  is_read: boolean; created_at: string
}

export interface PestLibrary {
  id: string; name_id: string; name_en?: string; type: PestType
  description?: string; symptoms?: string[]; treatment?: string[]
  prevention?: string[]; image_url?: string
}

// IoT webhook payload
export interface IoTWebhookPayload {
  device_key: string; firmware?: string; timestamp: string
  sensors: { temperature: number; humidity: number; pressure: number; motion_detected: boolean }
  system: { battery_pct: number; signal_dbm: number; uptime_seconds: number }
  image?: { base64: string; width: number; height: number; trigger: 'motion' | 'scheduled' }
}
