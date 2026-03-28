import { Injectable } from '@nestjs/common';
import Sharp from 'sharp';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class ImageService {
  async convertSvgToPng(svgString: string): Promise<Buffer> {
    try {
      const buffer = await Sharp(Buffer.from(svgString)).png().toBuffer();
      return buffer;
    } catch (error) {
      console.error('Error converting SVG to PNG:', error);
      throw error;
    }
  }

  async fetchImage(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, { timeout: 5000 }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        response.on('error', reject);
      }).on('error', reject);
    });
  }

  async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    try {
      return await Sharp(buffer).resize(width, height, { fit: 'cover' }).toBuffer();
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }

  async addWatermark(imageBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const svgWatermark = Buffer.from(`
        <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="35" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.7">
            ${watermarkText}
          </text>
        </svg>
      `);

      return await Sharp(imageBuffer)
        .composite([{ input: svgWatermark, gravity: 'southeast' }])
        .toBuffer();
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw error;
    }
  }

  async combineImages(baseImage: Buffer, overlayImage: Buffer, gravity: 'southeast' | 'southwest' | 'northeast' | 'northwest' | 'center' = 'center'): Promise<Buffer> {
    try {
      return await Sharp(baseImage)
        .composite([{ input: overlayImage, gravity }])
        .toBuffer();
    } catch (error) {
      console.error('Error combining images:', error);
      throw error;
    }
  }

  async optimizeImage(buffer: Buffer, quality = 80): Promise<Buffer> {
    try {
      return await Sharp(buffer).png({ quality }).toBuffer();
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw error;
    }
  }
}
