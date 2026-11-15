export async function compressToWebP(file: File, maxDimension: number = 1024): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            // Clean up memory immediately
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context not available.'));
                return;
            }

            // Draw the resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Export as WebP at 80% quality (ideal for AI restyling input)
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Image compression failed.'));
                        return;
                    }
                    
                    // Swap the original extension for .webp
                    const newFileName = file.name.replace(/\.[^/.]+$/, ".webp");
                    
                    const compressedFile = new File([blob], newFileName, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });
                    
                    resolve(compressedFile);
                },
                'image/webp',
                0.8
            );
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(objectUrl);
            reject(error);
        };

        img.src = objectUrl;
    });
}