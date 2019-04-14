export interface ValidationError {
  file: File;
  error: string; // is FileValidationType enum type
}
export enum FileValidationTypes {
  fileMaxSize = 'FILE_MAX_SIZE',
  fileMaxCount = 'FILE_MAX_COUNT',
  totalMaxSize = 'TOTAL_MAX_SIZE',
  extensions = 'EXTENSIONS',
  uploadType = 'UPLOAD_TYPE',
  customValidator = 'CUSTOM_VALIDATOR'
}
