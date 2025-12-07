export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64Data: string; // Raw base64 without prefix
  mimeType: string;
}

export interface GeneratedImage {
  imageUrl: string;
}