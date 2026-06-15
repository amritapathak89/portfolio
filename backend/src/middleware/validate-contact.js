// Lightweight, dependency-free validation for the contact form payload.

const MAX = { name: 100, email: 254, company: 150, phone: 30, message: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isStr(v) {
  return typeof v === "string";
}

function validateContact(req, res, next) {
  const { name, email, company, phone, message } = req.body || {};
  const errors = [];

  if (!isStr(name) || !name.trim()) errors.push("name is required");
  else if (name.length > MAX.name) errors.push("name is too long");

  if (!isStr(email) || !EMAIL_RE.test(email)) errors.push("a valid email is required");
  else if (email.length > MAX.email) errors.push("email is too long");

  if (!isStr(message) || !message.trim()) errors.push("message is required");
  else if (message.length > MAX.message) errors.push("message is too long");

  // Optional fields: only length-check when present.
  if (company != null && (!isStr(company) || company.length > MAX.company))
    errors.push("company is invalid");
  if (phone != null && (!isStr(phone) || phone.length > MAX.phone)) errors.push("phone is invalid");

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
}

module.exports = validateContact;
