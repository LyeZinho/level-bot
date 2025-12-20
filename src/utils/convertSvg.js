import sharp from 'sharp';

/**
 * Converte uma string SVG para PNG buffer
 * @param {string} svg - Conteúdo SVG
 * @param {object} options - options.width, options.height, options.quality
 * @returns {Promise<Buffer>} PNG Buffer
 */
export async function svgToPng(svg, options = {}) {
  const { width, height, quality = 80 } = options;
  const buffer = Buffer.from(svg);

  let image = sharp(buffer).png({ quality });

  if (width || height) {
    image = image.resize(width || null, height || null, { fit: 'contain' });
  }

  return image.toBuffer();
}

export async function svgToJpeg(svg, options = {}) {
  const { width, height, quality = 80 } = options;
  const buffer = Buffer.from(svg);

  let image = sharp(buffer).jpeg({ quality });

  if (width || height) {
    image = image.resize(width || null, height || null, { fit: 'contain' });
  }

  return image.toBuffer();
}
