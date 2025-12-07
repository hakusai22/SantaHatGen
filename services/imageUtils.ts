
/**
 * Processes the image to fit better in circular avatars by adding padding.
 * It creates a square canvas, fills the background with a blurred version of the original image,
 * and centers the original image within it. This provides space for the hat.
 */
export const prepareImageForAvatar = async (base64Data: string, mimeType: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Handle cross-origin if needed, though usually base64 is fine
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Determine dimensions
      // We want a square output that is larger than the original to allow "zoom out" effect
      const maxDim = Math.max(img.width, img.height);
      const paddingFactor = 1.6; // 60% larger canvas gives ample room for hats
      const newSize = Math.floor(maxDim * paddingFactor);

      canvas.width = newSize;
      canvas.height = newSize;

      // 1. Draw Blurred Background
      // We draw the image scaled up to cover the whole canvas and blur it
      ctx.save();
      ctx.filter = 'blur(40px) brightness(1.1)'; // Brighten slightly for a festive feel
      // Draw image to cover the canvas (like object-fit: cover)
      const scale = Math.max(newSize / img.width, newSize / img.height);
      const xOffset = (newSize - img.width * scale) / 2;
      const yOffset = (newSize - img.height * scale) / 2;
      ctx.drawImage(img, xOffset, yOffset, img.width * scale, img.height * scale);
      ctx.restore();

      // 2. Draw Original Image Centered
      // We maintain aspect ratio
      const drawX = (newSize - img.width) / 2;
      const drawY = (newSize - img.height) / 2;

      // Add a subtle shadow to separate the image from the background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 10;

      ctx.drawImage(img, drawX, drawY);

      // Return raw base64 data (stripping the prefix to match existing service expectation if needed,
      // but generateContent can take full url if parsed, let's return full for easier handling then strip later)
      const dataUrl = canvas.toDataURL(mimeType);
      // Our service expects raw base64, so let's strip the prefix here if the caller expects raw
      // But wait, the service helper takes raw. Let's return raw base64.
      const rawBase64 = dataUrl.split(',')[1];
      resolve(rawBase64);
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for processing'));
    };

    img.src = `data:${mimeType};base64,${base64Data}`;
  });
};
