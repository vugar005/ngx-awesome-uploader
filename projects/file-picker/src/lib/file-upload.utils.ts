export function getFileCategoryType(fileExtension: string): string {
  if (fileExtension.includes('image')) {
    return 'image';
  } else if (fileExtension.includes('video')) {
    return 'video';
  } else {
    return 'other';
  }
}

export function getFileType(name: string): string {
  return name.split('.').pop().toUpperCase();
}

export function isImageFile(fileType: string): boolean {
  const IMAGE_TYPES = ['PNG', 'JPG', 'JPEG', 'BMP', 'WEBP', 'JFIF', 'TIFF'];
  return (IMAGE_TYPES as any).includes(fileType.toUpperCase());
}
