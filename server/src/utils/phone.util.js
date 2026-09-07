/**
 * Phone Number Utilities for Somalia (Country Code 252)
 *
 * Rules:
 * - Country code 252 is fixed.
 * - User enters exactly 9 digits (e.g. 615788577).
 * - Normalized number format: 252615788577
 */

export const SOMALIA_COUNTRY_CODE = '252';

/**
 * Validate 9-digit Somalian local phone input (or already normalized 252+9 digits).
 * @param {string} phone
 * @param {boolean} [allowEmpty=false]
 * @returns {boolean}
 */
export const isValidSomaliPhone = (phone, allowEmpty = false) => {
  if (!phone || typeof phone !== 'string') {
    return allowEmpty;
  }
  const clean = phone.trim().replace(/\s+/g, '');
  if (!clean) return allowEmpty;

  // Check 9 digits (e.g. 615788577)
  if (/^\d{9}$/.test(clean)) {
    return true;
  }

  // Check 12 digits starting with 252 (e.g. 252615788577)
  if (/^252\d{9}$/.test(clean)) {
    return true;
  }

  return false;
};

/**
 * Normalize phone input to 252XXXXXXXXX (12 digits).
 * @param {string} phone
 * @returns {string}
 */
export const normalizeSomaliPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.trim().replace(/[^\d]/g, '');
  if (!clean) return '';

  if (clean.startsWith('252') && clean.length === 12) {
    return clean;
  }

  if (clean.length === 9) {
    return `252${clean}`;
  }

  return clean;
};

/**
 * Format for display (e.g. +252 61 5788577 or 9-digit local part).
 * @param {string} phone
 * @returns {string}
 */
export const formatSomaliPhoneDisplay = (phone) => {
  const normalized = normalizeSomaliPhone(phone);
  if (normalized.length === 12 && normalized.startsWith('252')) {
    const local = normalized.slice(3);
    return `+252 ${local.slice(0, 2)} ${local.slice(2)}`;
  }
  return phone || '';
};
