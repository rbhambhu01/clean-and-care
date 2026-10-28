import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Fixed public_id (one slot, always overwritten) so the delivery URL never
// changes — the frontend can hardcode it instead of asking the backend "what
// is the current offer". This also sidesteps Render's ephemeral filesystem:
// nothing about "is there an offer" needs to live in our own database.
export const OFFER_IMAGE_PUBLIC_ID = "clean-care/offer-banner";

export function offerImageConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export default cloudinary;
