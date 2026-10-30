// Unsigned upload — no backend, no API secret in the browser. The upload
// preset (configured in the Cloudinary dashboard) is what gates this, not
// a secret: restrict it there to images only, a sane max size, and a fixed
// folder so this endpoint can't be abused for arbitrary uploads.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const OFFER_IMAGE_PUBLIC_ID = "clean-care/offer-banner";

export function cloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

// f_auto/q_auto pick the best format/quality for the viewer's browser;
// w_1200,c_limit caps delivered width at 1200px (never upscales smaller
// originals) so a huge upload doesn't ship full-resolution to a banner
// that's never wider than ~900px on the homepage.
export function offerImageSrcUrl() {
  if (!CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_1200,c_limit/${OFFER_IMAGE_PUBLIC_ID}.jpg`;
}

// XMLHttpRequest instead of fetch specifically because fetch has no
// reliable cross-browser way to report upload progress for a FormData
// body; XHR's upload.onprogress does.
export function uploadOfferImage(file, onProgress) {
  if (!cloudinaryConfigured()) {
    return Promise.reject(
      new Error("Image hosting isn't configured (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET missing)")
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);
  body.append("public_id", OFFER_IMAGE_PUBLIC_ID);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        return reject(new Error("Upload failed — unexpected response"));
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data.secure_url);
      } else {
        reject(new Error(data.error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed — network error"));
    xhr.send(body);
  });
}
