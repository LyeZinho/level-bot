export declare class ImageService {
    convertSvgToPng(svgString: string): Promise<Buffer>;
    fetchImage(url: string): Promise<Buffer>;
    resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer>;
    addWatermark(imageBuffer: Buffer, watermarkText: string): Promise<Buffer>;
    combineImages(baseImage: Buffer, overlayImage: Buffer, gravity?: 'southeast' | 'southwest' | 'northeast' | 'northwest' | 'center'): Promise<Buffer>;
    optimizeImage(buffer: Buffer, quality?: number): Promise<Buffer>;
}
//# sourceMappingURL=image.service.d.ts.map