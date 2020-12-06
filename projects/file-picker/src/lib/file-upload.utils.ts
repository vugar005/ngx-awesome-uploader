export function GET_FILE_CATEGORY_TYPE(fileExtension: string): string {
  if (fileExtension.includes('image')) {
    return 'image';
  } else if (fileExtension.includes('video')) {
    return 'video';
  } else {
    return 'other';
  }
}

export function GET_FILE_TYPE(name: string): string {
  return name.substr(name.lastIndexOf('.') + 1).toUpperCase();
}

export function IS_IMAGE_FILE(fileType: string): boolean {
  const IMAGE_TYPES = ['PNG', 'JPG', 'JPEG', 'BMP', 'WEBP', 'JFIF', 'TIFF'];
  return IMAGE_TYPES.includes(fileType.toUpperCase());
}
