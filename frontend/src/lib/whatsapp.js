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

export function sendCartOrderViaWhatsApp({ name, phone, address, items, total, discountPercent, discountAmount, finalTotal }) {
  const lines = [
    "New order from website cart:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    "",
    "Items:",
    ...items.map((l) => `- ${l.item} (${l.service.toUpperCase()}) x${l.qty} = ₹${l.price * l.qty}`),
    "",
    `Subtotal: ₹${total}`,
    ...(discountAmount > 0 ? [`Discount (${discountPercent}%): -₹${discountAmount}`, `Total: ₹${finalTotal}`] : []),
  ];
  openWhatsApp(lines.join("\n"));
}

export function sendServiceBookingViaWhatsApp({ serviceName, name, phone, address, message, locationUrl }) {
  const lines = [
    `New booking request — ${serviceName}:`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    ...(locationUrl ? [`Location: ${locationUrl}`] : []),
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

// Indian 10-digit numbers are stored as typed (no country code); wa.me
// links need the full international form.
function normalizePhone(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function formatStatus(status) {
  return (status || "pending")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function leadServiceLabel(type, lead) {
  if (type === "service") return lead.serviceName || "Service";
  if (type === "pickup") return lead.service || "Pickup";
  if (type === "cart") return "Order";
  return "Enquiry";
}

// Unlike the other send* helpers above (which message the business number),
// this one addresses the lead's own phone — it's the admin notifying a
// customer, not a customer contacting the business.
export function sendLeadUpdateViaWhatsApp({ type, lead, feedbackUrl }) {
  const label = leadServiceLabel(type, lead).toLowerCase();
  const status = lead.status || "pending";
  const lines = [`Hi ${lead.name || "there"}, this is Clean & Care.`];

  if (status === "completed") {
    lines.push(`Good news! Your ${label} is now complete. Thank you for choosing Clean & Care!`);
  } else {
    lines.push(`Update on your ${label}: ${formatStatus(status)}.`);
  }

  if (type === "cart" && lead.items?.length) {
    lines.push(`Items: ${lead.items.map((it) => `${it.item} x${it.qty}`).join(", ")}`);
    lines.push(`Total: ₹${lead.total}`);
  }
  if (lead.address) lines.push(`Address: ${lead.address}`);

  if (status === "completed" && feedbackUrl) {
    lines.push("");
    lines.push(`We'd love your feedback — please rate your experience: ${feedbackUrl}`);
  }

  const to = normalizePhone(lead.phone);
  window.open(`https://wa.me/${to}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
}
