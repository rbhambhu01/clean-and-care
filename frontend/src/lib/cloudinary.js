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

export function offerImageSrcUrl() {
  if (!CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${OFFER_IMAGE_PUBLIC_ID}.jpg`;
}

export async function uploadOfferImage(file) {
  if (!cloudinaryConfigured()) {
    throw new Error("Image hosting isn't configured (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET missing)");
  }
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);
  body.append("public_id", OFFER_IMAGE_PUBLIC_ID);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url;
}
