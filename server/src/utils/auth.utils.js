// Native Node.js Authentication Utilities (Password Hashing with bcrypt & JWT)
// Industry-standard bcrypt encryption with 10 salt rounds and HMAC-SHA256 tokens
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "y-library-campus-secret-key-2026";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a plain-text password using bcrypt (10 salt rounds)
 */
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verify a plain-text password against a stored bcrypt hash (or fallback legacy format)
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  // Standard bcrypt hash check ($2a$ or $2b$)
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compareSync(password, storedHash);
  }
  // Fallback for legacy salt:hex format
  if (storedHash.includes(":")) {
    try {
      const [salt, key] = storedHash.split(":");
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Helper: Base64Url encoding
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Helper: Base64Url decoding
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

/**
 * Generate a standard JSON Web Token (HMAC-SHA256)
 */
function generateToken(payload) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Date.now();
  const tokenPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + TOKEN_EXPIRY_MS) / 1000),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (signature !== expectedSignature) {
    return null; // Invalid signature
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Expired token
    }
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
};
