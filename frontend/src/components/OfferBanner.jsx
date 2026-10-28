import { useState } from "react";
import { offerImageUrl } from "../lib/offerImage.js";

// Renders nothing if no offer image is configured/uploaded, or if it fails
// to load (e.g. admin removed it). No backend call needed — see offerImage.js.
export default function OfferBanner() {
  const [failed, setFailed] = useState(false);

  if (!offerImageUrl || failed) return null;

  return (
    <section className="container-x py-10">
      <img
        src={offerImageUrl}
        alt="Current offer"
        className="mx-auto w-full max-w-4xl rounded-2xl shadow-lg"
        onError={() => setFailed(true)}
      />
    </section>
  );
}
