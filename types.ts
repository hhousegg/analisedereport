
export interface SlaThresholds {
  sdwan: number;
  wan1: number;
  wan2: number;
}

export interface FailedInterface {
  interfaceName: string;
  availability: number;
  expectedSla: number;
}

export interface FailedDeviceDetail {
  deviceName: string;
  failures: FailedInterface[];
  status: 'OUT_OF_SLA' | 'DATA_UNAVAILABLE';
}

export interface AnalysisResult {
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  failedDeviceDetails: FailedDeviceDetail[];
}
