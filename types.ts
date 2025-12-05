export interface SystemConfig {
  apiEnabled: boolean;
  // Note: apiKey is managed via process.env in this version for security
  lastUpdated?: string;
  updatedBy?: string;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
}

export interface PosePrompt {
  title: string;
  prompt: string;
}

export interface AnalyzerState {
  uploadedFile: UploadedFile | null;
  generatedPrompt: string;
}

export interface PoseState {
  uploadedFile: UploadedFile | null;
  posePrompts: PosePrompt[] | null;
}

export interface AlertState {
  show: boolean;
  title: string;
  message: string;
}

export interface LoadingState {
  show: boolean;
  title: string;
  message: string;
}