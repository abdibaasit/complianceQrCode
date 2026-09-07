import crypto from 'crypto';

/**
 * Generate human-readable unique reference numbers for Complaints and Feedback.
 * Examples:
 * CMP-2026-081492
 * TALO-2026-093821
 */
export const generateReferenceNumber = (type = 'COMPLAINT') => {
  const prefix = type === 'COMPLAINT' ? 'CMP' : 'TALO';
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}-${year}-${randomDigits}`;
};
