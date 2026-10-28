// Business WhatsApp number for the website's "Send Message" / "Schedule Pickup"
// forms. Indian number, full international format (no "+", no leading 0) as
// required by wa.me click-to-chat links.
const WHATSAPP_NUMBER = "919428330909";

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function sendContactViaWhatsApp({ name, phone, email, message }) {
  const lines = [
    "New message from website:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "N/A"}`,
    `Message: ${message || "N/A"}`,
  ];
  openWhatsApp(lines.join("\n"));
}

export function sendPickupViaWhatsApp({ name, phone, address, service, preferredDate }) {
  const lines = [
    "New pickup request from website:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    `Service: ${service || "General Laundry"}`,
    `Preferred Date: ${preferredDate || "Not specified"}`,
  ];
  openWhatsApp(lines.join("\n"));
}
