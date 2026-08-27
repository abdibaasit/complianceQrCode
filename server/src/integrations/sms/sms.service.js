import { ENV } from '../../config/env.js';

export const sendSms = async ({ recipient, message, senderId }) => {
  try {
    // In production, integrate with actual provider (Africa's Talking, Twilio, Hormuud SMS API, etc.)
    if (ENV.SMS_PROVIDER === 'REAL' && ENV.SMS_API_KEY) {
      // Real SMS provider call would go here
      console.log(`[SMS Provider] Sending real SMS to ${recipient}`);
    }

    // Default development/stub behavior
    console.log(`[SMS Mock] To: ${recipient} | Sender: ${senderId || ENV.SMS_SENDER_ID} | Message: ${message}`);

    return {
      success: true,
      provider: ENV.SMS_PROVIDER,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[SMS Error] Delivery failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
