"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
let ImageService = class ImageService {
    async convertSvgToPng(svgString) {
        try {
            const buffer = await (0, sharp_1.default)(Buffer.from(svgString)).png().toBuffer();
            return buffer;
        }
        catch (error) {
            console.error('Error converting SVG to PNG:', error);
            throw error;
        }
    }
    async fetchImage(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            protocol.get(url, { timeout: 5000 }, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to fetch image: ${response.statusCode}`));
                    return;
                }
                const chunks = [];
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
    async resizeImage(buffer, width, height) {
        try {
            return await (0, sharp_1.default)(buffer).resize(width, height, { fit: 'cover' }).toBuffer();
        }
        catch (error) {
            console.error('Error resizing image:', error);
            throw error;
        }
    }
    async addWatermark(imageBuffer, watermarkText) {
        try {
            const svgWatermark = Buffer.from(`
        <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="35" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.7">
            ${watermarkText}
          </text>
        </svg>
      `);
            return await (0, sharp_1.default)(imageBuffer)
                .composite([{ input: svgWatermark, gravity: 'southeast' }])
                .toBuffer();
        }
        catch (error) {
            console.error('Error adding watermark:', error);
            throw error;
        }
    }
    async combineImages(baseImage, overlayImage, gravity = 'center') {
        try {
            return await (0, sharp_1.default)(baseImage)
                .composite([{ input: overlayImage, gravity }])
                .toBuffer();
        }
        catch (error) {
            console.error('Error combining images:', error);
            throw error;
        }
    }
    async optimizeImage(buffer, quality = 80) {
        try {
            return await (0, sharp_1.default)(buffer).png({ quality }).toBuffer();
        }
        catch (error) {
            console.error('Error optimizing image:', error);
            throw error;
        }
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)()
], ImageService);
//# sourceMappingURL=image.service.js.map