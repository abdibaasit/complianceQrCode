import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/compliance-qr',
  JWT_SECRET: process.env.JWT_SECRET || 'compliance_qr_super_secret_jwt_key_2026_x89f7a2',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'compliance_qr_refresh_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'STUB',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_API_SECRET: process.env.SMS_API_SECRET || '',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'COMPLIANCE',
  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER || 'STUB',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  APP_TIMEZONE: process.env.APP_TIMEZONE || 'Africa/Mogadishu',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
  ADMIN_FULLNAME: process.env.ADMIN_FULLNAME || 'Platform Admin',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'REDACTED_API_KEY',
};
