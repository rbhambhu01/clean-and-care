// Matches backend/lib/cloudinary.js's OFFER_IMAGE_PUBLIC_ID + forced "jpg"
// format, so this URL is deterministic — no backend call needed to know
// "is there currently an offer image", we just try loading it and handle
// a 404 (no offer uploaded, or it was removed) by hiding the banner.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const offerImageUrl = CLOUD_NAME
  ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/clean-care/offer-banner.jpg`
  : null;
