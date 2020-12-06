export interface FilePreviewModel {
  /** uploadResponse is the response of api after file uploaded */
  uploadResponse?: any;
  file: File | Blob;
  fileName: string;
}
