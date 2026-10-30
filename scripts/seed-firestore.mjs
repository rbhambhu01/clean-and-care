// One-time data migration: pushes the site's existing content into Firestore.
// Run with: node scripts/seed-firestore.mjs
//
// Uses the Firebase *client* SDK (not Admin SDK) signed in as the admin
// account, so writes pass through the same Firestore Security Rules as the
// real app (admin-only writes on these collections) — no service account
// key needed.
import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars before running this script.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const company = {
  name: "Clean & Care",
  tagline: "Your Laundry, Our Care",
  strapline: "India's Leading laundry and dry-cleaning brand, proudly founded by an IITian",
  about: {
    heading: "We know how to build trust & offer the highest quality",
    body:
      "Clean & Care Laundry Services is not just your typical laundry service - we are a team of passionate individuals driven by the dedication and expertise of our founder, an IITian. Our journey began with a vision to revolutionise the laundry industry, and today, we are proud to offer a range of services that reflect our unwavering commitment to quality, trust, and customer satisfaction.",
    whyWeAre: {
      heading: "Experience Excellence in Fabric Care at Clean & Care.",
      body:
        "We invite you to explore our world of extraordinary laundry and dry cleaning. Let Clean & Care be your partner in maintaining and enhancing your wardrobe. Your clothes deserve the best, and that's what we deliver. Contact us today to schedule your first pickup and discover the extraordinary in fabric care.",
    },
    highlights: [
      { title: "Quick Service", description: "Fast turnaround without compromising on quality." },
      { title: "High Quality Detergent / Chemical Used", description: "Only premium, fabric-safe detergents and solvents." },
      { title: "100% Sanitized", description: "Every garment is sanitized for complete hygiene." },
      { title: "Doorstep Pickup & Drop", description: "Convenient pickup and delivery at your doorstep." },
      { title: "On Demand Service Available", description: "Book a pickup whenever you need it." },
      { title: "Expert Cleaning", description: "Trained professionals handle every fabric with care." },
    ],
  },
  offer: "Flat 10% Off on your first order",
  ctaHeading: "Experience Our Superior Services Today!",
  address: {
    line1: "Shop No. GF-2, Dev Priya Complex, Motera Stadium Road,",
    line2: "Motera, Ahmedabad - 380005",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
  },
  phones: ["+91-81606-77875"],
  email: "support@cleanandcare.example",
  social: { youtube: "#", facebook: "#", linkedin: "#" },
  footerQuote: "India's Trusted Live Professional Laundry & Dry-Cleaning Services at Global Standards",
  designCredit: "Clean & Care",
};

const services = [
  { slug: "dry-cleaning", title: "Dry Cleaning", icon: "shirt", category: "fabric", description: "Garments treated using eco-friendly solvents like oil-based hydrocarbons with imported machinery. Covers bridal wear, silk sarees, woollens, suits, lehengas and more." },
  { slug: "wet-cleaning", title: "Wet Cleaning", icon: "washing-machine", category: "fabric", description: "Water-based cleaning with water softener technology included at no extra cost, safe for delicate fabrics." },
  { slug: "steam-ironing", title: "Steam Ironing", icon: "iron", category: "fabric", description: "Available for clothing and linens, with customizable temperature and steam levels per customer preference." },
  { slug: "bag-cleaning", title: "Bag Cleaning", icon: "briefcase", category: "accessories", description: "Deep cleaning and conditioning for bags of all materials to restore shape, colour and finish." },
  { slug: "shoe-cleaning", title: "Shoe Cleaning", icon: "shoe", category: "accessories", description: "Thorough cleaning, stain removal, conditioning, repairs and optional weatherproofing for leather, suede and other shoe types." },
  { slug: "carpet-cleaning", title: "Carpet Cleaning", icon: "carpet", category: "home", description: "Specialized deep cleaning for carpets that lifts dust, allergens and stains while protecting fibres." },
  { slug: "curtain-cleaning", title: "Curtain Cleaning", icon: "curtains", category: "home", description: "Gentle cleaning for curtains and blinds that removes dust and odours without damaging fabric." },
  { slug: "toy-cleaning", title: "Toy Cleaning", icon: "toy", category: "specialized", description: "Child-safe cleaning process for stuffed animals and plush toys, including stain removal." },
  { slug: "home-sanitize", title: "Home Sanitize", icon: "spray", category: "home", description: "Professional home sanitizing service to keep your living spaces hygienic and safe." },
  { slug: "car-cleaning", title: "Car Cleaning", icon: "car", category: "specialized", description: "Interior and exterior wash, vacuuming, dashboard and window cleaning, plus wax treatment." },
  { slug: "home-cleaning", title: "Home Cleaning", icon: "home", category: "home", description: "General home cleaning services tailored to keep every corner of your home spotless." },
  { slug: "sofa-cleaning", title: "Sofa Cleaning", icon: "sofa", category: "home", description: "Specialized upholstery cleaning that removes stains and odours while protecting the fabric." },
  { slug: "premium-laundry", title: "Premium Laundry", icon: "sparkles", category: "fabric", description: "Every cloth goes through a comprehensive 6 stage process enabling us to deliver sparkling & fresh clothes, every time. Standard turnaround 24 hours; express service available." },
  { slug: "laundry-by-kg", title: "Laundry by Kg", icon: "scale", category: "fabric", description: "Affordable wash & fold / wash & steam iron service billed by weight, ideal for everyday laundry." },
  { slug: "shoes-spa", title: "Shoes Spa", icon: "shoe", category: "accessories", description: "A complete spa treatment for leather, sports, canvas and suede shoes to restore their original shine." },
];

const pricingCategories = [
  {
    category: "Men's Dry Cleaning (DC) & Steam Iron (SI)",
    items: [
      { item: "Waist Coat/Modi Coat/Sleeveless Coat", dc: 145, si: 55 },
      { item: "Kurta Pajama (Light)", dc: 155, si: 75 },
      { item: "Kurta Pajama (Heavy)", dc: 275, si: 129 },
      { item: "Coat Short", dc: 225, si: 105 },
      { item: "Jacket-Short", dc: 195, si: 95 },
      { item: "Overcoat", dc: 285, si: 139 },
      { item: "Safari Shirt & Pant", dc: 195, si: 95 },
      { item: "Cotton Shirt", dc: 99, si: 20 },
      { item: "Shorts", dc: 59, si: 25 },
      { item: "Socks Pair", dc: 35, si: null },
      { item: "Suit 2 Pc", dc: 295, si: 145 },
      { item: "Suit 3 Pc", dc: 375, si: 159 },
      { item: "Sweater/Cardigan Full Sleeve", dc: 155, si: 75 },
      { item: "Sweater/Cardigan Sleeveless", dc: 135, si: 65 },
      { item: "Shawl/Lohi", dc: 155, si: 75 },
      { item: "Tie", dc: 55, si: 25 },
      { item: "Pants/Trousers", dc: 105, si: 49 },
      { item: "Jeans", dc: 115, si: 55 },
      { item: "T-Shirt", dc: 99, si: 45 },
      { item: "Dhoti/Lungi (Silk)", dc: 95, si: 45 },
      { item: "Shirt & Dhoti (Silk)", dc: 135, si: 65 },
      { item: "Undergarment", dc: 35, si: 15 },
    ],
  },
  {
    category: "Women's Services",
    items: [
      { item: "Blouse/Top", dc: 75, si: 35 },
      { item: "Choli+Lehanga+Dupatta", dc: 585, si: 285 },
      { item: "Dress (Cotton)", dc: 175, si: 85 },
      { item: "Dress (Heavy)", dc: 345, si: 169 },
      { item: "Dupatta", dc: 75, si: 35 },
      { item: "Kameez/Kurta", dc: 85, si: 45 },
      { item: "Pyjama/Pants/Salwar/Churidar/Palazo Pants", dc: 75, si: 35 },
      { item: "Kurta + Pyjama/Salwar/Churidar", dc: 155, si: 75 },
      { item: "Kurta Pyjamas/Salwar/Churidar+Dupatta", dc: 225, si: 109 },
      { item: "Lehanga/Flared Skirt", dc: 285, si: 139 },
      { item: "Saree (Cotton/Synthetic/Light)", dc: 155, si: 75 },
      { item: "Saree (Silk/Chiffon/Georgette/Pattu/Heavy)", dc: 235, si: 115 },
      { item: "Saree (Embroidered/Heavy)", dc: 275, si: 135 },
      { item: "Petti Coat", dc: 69, si: 35 },
      { item: "Sherwani/Achkan", dc: 299, si: 145 },
      { item: "Skirt - Pencil/Pleated/Other", dc: 85, si: 45 },
      { item: "Stocking (Pair) - Regular", dc: 59, si: 25 },
      { item: "Stole/Scarf", dc: 49, si: 25 },
      { item: "Shorts", dc: 49, si: 25 },
      { item: "Shawl", dc: 125, si: 39 },
    ],
  },
  {
    category: "Home Services",
    items: [
      { item: "Bath Mat", dc: 39, si: null },
      { item: "Bath Robe Small", dc: 49, si: null },
      { item: "Bath Robe Big", dc: 69, si: null },
      { item: "Bath Towel", dc: 49, si: null },
      { item: "Bed Cover Single", dc: 119, si: 99 },
      { item: "Bed Cover Double/King", dc: 279, si: 139 },
      { item: "Bed Sheet Single", dc: 99, si: 49 },
      { item: "Bed Sheet Double/King", dc: 159, si: 79 },
      { item: "Blanket Single", dc: 279, si: null },
      { item: "Blanket Double/King", dc: 359, si: null },
      { item: "Cushion Cover Small", dc: 59, si: 29 },
      { item: "Cushion Cover Big", dc: 99, si: 49 },
      { item: "Small Pillow Cover Cotton/Terry Cotton", dc: 39, si: null },
      { item: "Pillow Cover Embroidery", dc: 79, si: 39 },
      { item: "Quilt Single", dc: 359, si: null },
      { item: "Quilt Double King", dc: 439, si: null },
      { item: "Quilt Cover (Single)", dc: 199, si: 99 },
      { item: "Quilt Cover (Double/King)", dc: 279, si: 139 },
      { item: "Stuff Toy Small", dc: 99, si: null },
      { item: "Stuff Toy Medium", dc: 159, si: null },
      { item: "Stuff Toy Big", dc: 249, si: null },
      { item: "Curtain Without Lining [Per Panel]", dc: 189, si: 95 },
      { item: "Curtain With Lining [Per Panel]", dc: 279, si: 139 },
      { item: "Face Towel", dc: 29, si: null },
      { item: "Hand Towel", dc: 39, si: null },
      { item: "Sofa Cover Per Seat", dc: 99, si: null },
      { item: "Table Cloth Small", dc: 69, si: 35 },
      { item: "Table Cloth Big", dc: 119, si: 39 },
      { item: "Table Runner - Fancy", dc: 139, si: 69 },
      { item: "Foot Mat (1 to 2 feet)", dc: 49, si: null },
      { item: "Pram", dc: 319, si: null },
      { item: "Suit Case Small", dc: 199, si: null },
      { item: "Suit Case Medium", dc: 319, si: null },
      { item: "Suit Case Big", dc: 399, si: null },
    ],
  },
  {
    category: "Kids Services",
    items: [
      { item: "Blouse/Top", dc: 55, si: 25 },
      { item: "Choli+Lehanga+Dupatta", dc: 309, si: 149 },
      { item: "Dress (Heavy)", dc: 199, si: 99 },
      { item: "Skirt", dc: 65, si: 35 },
      { item: "Frock", dc: 99, si: 49 },
      { item: "Kurta+Pant/Salwar/Churidar+Dupatta", dc: 239, si: 119 },
      { item: "Shorts", dc: 39, si: 19 },
      { item: "T-Shirt", dc: 49, si: 25 },
      { item: "Coat", dc: 139, si: 69 },
      { item: "Jacket", dc: 119, si: 59 },
      { item: "2Pc Suit", dc: 189, si: 95 },
      { item: "3Pc Suit", dc: 239, si: 119 },
      { item: "Sweater (Full Sleeves)", dc: 99, si: 49 },
      { item: "Sweater (Sleeveless)", dc: 89, si: 45 },
    ],
  },
];

const pricingExtras = {
  addOns: [
    { service: "Moth Proofing", price: "20/Kg" },
    { service: "Antiseptic", price: "10/Kg" },
    { service: "Stain Removal", price: "30/Stain" },
    { service: "Starch", price: "25/Pcs" },
    { service: "Softner", price: "5/Kg" },
    { service: "Extra Soiled", price: "10/Kg" },
  ],
  byWeight: [
    { service: "Wash & Fold", price: "69/Kg" },
    { service: "Wash & Steam Iron", price: "99/Kg" },
    { service: "Woollen/Premium Laundry", price: "159/Kg" },
    { service: "Steam Ironing", price: "20/Pcs" },
  ],
  shoesSpa: [
    { service: "Leather Shoes", price: "349" },
    { service: "Sports Shoes", price: "249" },
    { service: "Canvas Shoes", price: "199" },
    { service: "Boots/Suede Leather Shoes", price: "399" },
  ],
};

const testimonials = [
  { id: "1", name: "Raghubansh Singh", rating: 5, text: "First and foremost, their customer service was top-notch. When I called to inquire about their services, the staff was friendly, knowledgeable, and patient in answering all my questions. They made me feel comfortable right from the beginning." },
  { id: "2", name: "Manish Gautam", rating: 5, text: "In terms of pricing, I found their rates to be competitive, especially considering the high quality of their work and the convenience they offer. The convenience of pickup and delivery service was a game-changer for my busy schedule." },
  { id: "3", name: "Smruti Arora", rating: 5, text: "Clean & Care Laundry Service is a lifesaver for a busy working woman like me. Their timely, high-quality service has made laundry a breeze. I highly recommend them." },
  { id: "4", name: "Sachin Rajput", rating: 5, text: "The team is professional and the turnaround time is excellent. My clothes come back looking brand new every single time." },
  { id: "5", name: "Pratibha Pal", rating: 5, text: "Great attention to detail and genuinely caring staff. It's rare to find a service this consistent and trustworthy." },
];

const blog = [
  { id: "1", title: "Up your living standard, on a budget!!!", author: "CleanAndCare", date: "2023-10-31", excerpt: "Simple, affordable habits that keep your home and wardrobe feeling fresh without breaking the bank." },
  { id: "2", title: "5 signs your clothes need professional dry cleaning", author: "CleanAndCare", date: "2023-11-14", excerpt: "Not every stain belongs in the washing machine. Here's how to tell when it's time to call the experts." },
  { id: "3", title: "How doorstep laundry pickup saves your weekend", author: "CleanAndCare", date: "2023-11-28", excerpt: "Reclaim your Saturdays with a laundry routine that comes to you." },
];

async function seed() {
  console.log(`Signing in as ${ADMIN_EMAIL}...`);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  console.log("Writing company/main...");
  await setDoc(doc(db, "company", "main"), company);

  console.log(`Writing ${services.length} services...`);
  await Promise.all(
    services.map((s, i) => setDoc(doc(db, "services", s.slug), { ...s, order: i }))
  );

  console.log(`Writing ${pricingCategories.length} pricing categories...`);
  await Promise.all(
    pricingCategories.map((c, i) => setDoc(doc(db, "pricingCategories", String(i)), { ...c, order: i }))
  );

  console.log("Writing pricingExtras/main...");
  await setDoc(doc(db, "pricingExtras", "main"), pricingExtras);

  console.log(`Writing ${testimonials.length} testimonials...`);
  await Promise.all(
    testimonials.map((t, i) => setDoc(doc(db, "testimonials", t.id), { ...t, order: i }))
  );

  console.log(`Writing ${blog.length} blog posts...`);
  await Promise.all(
    blog.map((b, i) => setDoc(doc(db, "blog", b.id), { ...b, order: i }))
  );

  console.log("Writing settings/offerBanner (initial: hidden)...");
  await setDoc(doc(db, "settings", "offerBanner"), { visible: false });

  console.log("Done! Firestore seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
