import { ENV } from '../../config/env.js';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Clean & format phone number for Tabaarak SMS.
 * Tabaarak expects 9-digit local numbers (e.g., "615788577", "62XXXXXXX", "68XXXXXXX").
 * @param {string} phone
 * @returns {string}
 */
export const formatForTabaarak = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.startsWith('252') && clean.length === 12) {
    clean = clean.slice(3); // Remove 252 prefix -> 9 digits
  } else if (clean.startsWith('0') && clean.length === 10) {
    clean = clean.slice(1); // Remove leading 0 -> 9 digits
  }
  return clean;
};

/**
 * Authenticate with Tabaarak SMS Gateway.
 * POST https://sms.tabaarak.com/Auth/SMSLogin
 * @returns {Promise<string|null>} Bearer Token
 */
export const loginTabaarak = async (forceRefresh = false) => {
  const username = ENV.TABAARAK_SMS_NAME;
  const password = ENV.TABAARAK_SMS_PASSWORD;

  if (!username || !password) {
    return null;
  }

  // Use cached token if still valid (valid for 12 hours)
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const baseUrl = ENV.TABAARAK_SMS_BASE_URL.replace(/\/+$/, '');
    const loginUrl = `${baseUrl}/Auth/SMSLogin`;

    console.log(`[Tabaarak SMS] Authenticating user: ${username}...`);
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: username,
        Password: password,
      }),
    });

    const data = await response.json();

    if (data && data.success && data.data?.token) {
      cachedToken = data.data.token;
      tokenExpiresAt = Date.now() + 12 * 60 * 60 * 1000;
      console.log(`[Tabaarak SMS] Authentication successful! Account: ${data.data.name || username}`);
      return cachedToken;
    } else {
      console.error('[Tabaarak SMS] Authentication failed response:', data);
      return null;
    }
  } catch (error) {
    console.error('[Tabaarak SMS Auth Error]:', error.message);
    cachedToken = null;
    return null;
  }
};

/**
 * Send SMS message via Tabaarak Gateway.
 * POST https://sms.tabaarak.com/Sms/sendsms
 *
 * @param {Object} params
 * @param {string|string[]} params.recipient - Single phone string or array of phones
 * @param {string} params.message - SMS text content
 * @param {string} [params.senderId] - Optional sender ID
 * @returns {Promise<{ success: boolean, messageId?: string, data?: any, error?: string }>}
 */
export const sendSms = async ({ recipient, message, senderId }) => {
  try {
    if (!recipient || !message) {
      return { success: false, error: 'Recipient and message are required' };
    }

    // Convert single recipient or array to array of clean numbers
    const rawList = Array.isArray(recipient) ? recipient : [recipient];
    const mobileNumbers = rawList
      .map(formatForTabaarak)
      .filter((num) => num.length >= 7);

    if (mobileNumbers.length === 0) {
      return { success: false, error: 'No valid phone numbers provided for SMS delivery' };
    }

    const username = ENV.TABAARAK_SMS_NAME;
    const password = ENV.TABAARAK_SMS_PASSWORD;

    // If Tabaarak credentials exist, send via official API
    if (username && password) {
      let token = await loginTabaarak();

      if (!token) {
        throw new Error('Failed to obtain Tabaarak SMS authentication token');
      }

      const baseUrl = ENV.TABAARAK_SMS_BASE_URL.replace(/\/+$/, '');
      const sendUrl = `${baseUrl}/Sms/sendsms`;

      let response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smsMessage: message,
          mobile: mobileNumbers,
        }),
      });

      // Handle token expiration / 401 retry
      if (response.status === 401) {
        console.warn('[Tabaarak SMS] Token expired (401), refreshing token and retrying...');
        token = await loginTabaarak(true);
        if (token) {
          response = await fetch(sendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              smsMessage: message,
              mobile: mobileNumbers,
            }),
          });
        }
      }

      const data = await response.json();

      if (data && (data.success || data.data?.acceptedForDelivery)) {
        console.log(`[Tabaarak SMS] Successfully sent SMS to ${mobileNumbers.join(', ')}`);
        return {
          success: true,
          provider: 'TABAARAK_SMS',
          messageId: `tabaarak_${Date.now()}`,
          data: data.data,
          timestamp: new Date(),
        };
      } else {
        console.error('[Tabaarak SMS] Provider rejected SMS:', data);
        return {
          success: false,
          error: data?.message || 'Tabaarak SMS rejected message',
          data,
        };
      }
    }

    // Development / Mock fallback when credentials are not yet entered in .env
    console.log(
      `[Tabaarak SMS Mock] To: ${mobileNumbers.join(', ')} | Message: ${message}`
    );
    return {
      success: true,
      provider: 'TABAARAK_MOCK',
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[Tabaarak SMS Error]:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Retrieve current SMS Balance from Tabaarak.
 * GET https://sms.tabaarak.com/sms/GetSmsBalance
 * @returns {Promise<{ success: boolean, balance?: number|string, accountType?: string, error?: string }>}
 */
export const getSmsBalance = async () => {
  try {
    const token = await loginTabaarak();
    if (!token) {
      return { success: false, error: 'Tabaarak SMS credentials not configured or login failed' };
    }

    const baseUrl = ENV.TABAARAK_SMS_BASE_URL.replace(/\/+$/, '');
    const balanceUrl = `${baseUrl}/sms/GetSmsBalance`;

    const response = await fetch(balanceUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data && data.success) {
      return {
        success: true,
        balance: data.data?.balance,
        accountType: data.data?.accountType,
        data: data.data,
      };
    }

    return {
      success: false,
      error: data?.message || 'Failed to retrieve balance',
    };
  } catch (error) {
    console.error('[Tabaarak SMS Balance Error]:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
