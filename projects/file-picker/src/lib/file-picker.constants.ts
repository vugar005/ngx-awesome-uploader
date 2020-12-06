export const DEFAULT_CROPPER_OPTIONS = {
    dragMode: 'crop',
    aspectRatio: 1,
    autoCrop: true,
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 0.8
};

export function BITS_TO_MB(size: number): number {
   return parseFloat(size.toString()) / 1048576;
}
