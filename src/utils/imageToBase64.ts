export default function fileToBase64Async(file: any) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      resolve(e.target.result);
    };
  });
}

export function compressImages(base64Str: any, quality: any) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx: any = canvas.getContext('2d');
      let imageWidth = img.width;
      let imageHeight = img.height;
      if (img.width > 600 || img.height > 600) {
        if (img.width > img.height) {
          imageWidth = 600;
          imageHeight = 600 * (img.height / img.width);
        } else {
          imageHeight = 600;
          imageWidth = 600 * (img.width / img.height);
        }
      }
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64Str = canvas.toDataURL('image/png', quality);
      resolve(compressedBase64Str);
    };
  });
}
