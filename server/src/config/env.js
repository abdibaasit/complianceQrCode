import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory or in server directory
if (fs.existsSync(path.resolve('server/.env'))) {
  dotenv.config({ path: path.resolve('server/.env') });
} else if (fs.existsSync(path.resolve('.env'))) {
  dotenv.config({ path: path.resolve('.env') });
} else {
  dotenv.config();
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/compliance-qr',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '3d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  DEFAULT_USER_PASSWORD: process.env.DEFAULT_USER_PASSWORD || 'Compliance@2026',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'STUB',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_API_SECRET: process.env.SMS_API_SECRET || '',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'COMPLIANCE',
  APP_TIMEZONE: process.env.APP_TIMEZONE || 'Africa/Mogadishu',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
  ADMIN_FULLNAME: process.env.ADMIN_FULLNAME || 'Platform Admin',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  // Tabaarak SMS Gateway Configuration
  TABAARAK_SMS_NAME: process.env.TABAARAK_SMS_NAME || process.env.SMS_NAME || '',
  TABAARAK_SMS_PASSWORD: process.env.TABAARAK_SMS_PASSWORD || process.env.SMS_PASSWORD || '',
  TABAARAK_SMS_BASE_URL: process.env.TABAARAK_SMS_BASE_URL || 'https://sms.tabaarak.com',
  // SMTP Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};

/**
 * Validate required environment variables on server startup
 */
export const validateEnv = () => {
  const isProduction = ENV.NODE_ENV === 'production';
  const missing = [];

  if (!ENV.MONGODB_URI) missing.push('MONGODB_URI');
  if (!ENV.JWT_SECRET) missing.push('JWT_SECRET');
  if (!ENV.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (isProduction && missing.length > 0) {
    throw new Error(
      `[FATAL] Missing required production environment variables: ${missing.join(', ')}. Server startup aborted.`
    );
  }

  // Provide development fallbacks if running locally in dev mode
  if (!ENV.JWT_SECRET) {
    console.warn('[ENV Warning] JWT_SECRET is not set in .env. Using ephemeral dev key.');
    ENV.JWT_SECRET = 'dev_jwt_secret_ephemeral_key_replace_in_env_2026';
  }
  if (!ENV.JWT_REFRESH_SECRET) {
    console.warn('[ENV Warning] JWT_REFRESH_SECRET is not set in .env. Using ephemeral dev refresh key.');
    ENV.JWT_REFRESH_SECRET = 'dev_jwt_refresh_ephemeral_key_replace_in_env_2026';
  }
};

