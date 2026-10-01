// Escape user input before using it inside a RegExp to prevent ReDoS/injection
const escapeRegex = (input = '') => String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Clamp pagination values to safe bounds
const clampPage = (value, fallback = 1) => Math.max(1, parseInt(value) || fallback);
const clampLimit = (value, fallback = 10, max = 100) => Math.min(max, Math.max(1, parseInt(value) || fallback));

module.exports = { escapeRegex, clampPage, clampLimit };
