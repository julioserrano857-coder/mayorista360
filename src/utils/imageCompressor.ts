/**
 * Utility to process and optimize image files uploaded by the user.
 * Resizes large camera/phone images using HTML5 Canvas to prevent LocalStorage quota overflow,
 * maintaining high visual quality for product catalogs.
 */
export async function processImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file is SVG, read as text/dataURL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (JPEG, PNG, WEBP, etc.)
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw dataURL if canvas context is unavailable
          resolve(reader.result as string);
          return;
        }

        // Fill with white background for transparency in JPEG if needed
        const hasAlpha = file.type === 'image/png' || file.type === 'image/webp';
        if (!hasAlpha) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw image scaled
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG for optimal compression ratio
        const mimeType = hasAlpha ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
