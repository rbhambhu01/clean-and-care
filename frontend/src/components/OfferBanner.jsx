import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { offerImageSrcUrl } from "../lib/cloudinary.js";
import { db } from "../lib/firebase.js";

// Renders nothing unless Firestore's settings/offerBanner.visible is true
// AND the image actually loads. Visibility is a Firestore flag (not "does
// the Cloudinary asset exist") because removing it client-side can't call
// Cloudinary's delete API — that needs a secret we don't have in the browser.
export default function OfferBanner() {
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "offerBanner"))
      .then((snap) => setVisible(snap.exists() && snap.data().visible === true))
      .catch(() => setVisible(false));
  }, []);

  const url = offerImageSrcUrl();
  if (!visible || !url || failed) return null;

  return (
    <section className="container-x py-10">
      <img
        src={url}
        alt="Current offer"
        className="mx-auto w-full max-w-4xl rounded-2xl shadow-lg"
        onError={() => setFailed(true)}
      />
    </section>
  );
}
