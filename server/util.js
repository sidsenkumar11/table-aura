const crypto = require("crypto");
const short = require("short-uuid");

/**
 * Splits a name string into first and last name by space.
 */
function splitName(fullName) {
  const nameParts = fullName.trim().split(" ");

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: "" };
  }

  const lastName = nameParts.pop();
  const firstName = nameParts.join(" ");

  return { firstName, lastName };
}

/**
 * Creates a random 6-character alphanumeric coupon code.
 */
function generateCouponCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

/**
 * Creates a random short uuid.
 */
function generateTrackingCode() {
  return short.generate();
}

module.exports = { splitName, generateCouponCode, generateTrackingCode };
