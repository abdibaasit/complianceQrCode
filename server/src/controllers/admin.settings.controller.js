import { asyncHandler } from '../utils/asyncHandler.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { logAudit } from '../services/audit.service.js';
import { getCachedSettings, invalidateSettingsCache } from '../utils/settingsCache.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getCachedSettings();

  res.status(200).json({
    success: true,
    data: { settings },
  });
});

export const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getCachedSettings();

  res.status(200).json({
    success: true,
    data: {
      platformName: settings.platformName || 'Compliance QR',
      logo: settings.logo || '',
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
    },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  const updateData = { ...req.body };

  if (req.file) {
    updateData.logo = `/uploads/logos/${req.file.filename}`;
  }

  if (!settings) {
    settings = await PlatformSettings.create(updateData);
  } else {
    settings = await PlatformSettings.findByIdAndUpdate(settings._id, updateData, { new: true });
  }

  invalidateSettingsCache();

  await logAudit({
    actorId: req.user?._id || req.user?.id,
    actorName: req.user?.fullName,
    actorRole: req.user?.role,
    action: 'PLATFORM_SETTINGS_UPDATED',
    resourceType: 'PlatformSettings',
    resourceId: settings._id,
    metadata: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Platform branding and settings updated successfully',
    data: { settings },
  });
});

export const getSmsGatewayStatus = asyncHandler(async (req, res) => {
  const { getSmsBalance } = await import('../integrations/sms/sms.service.js');
  const balanceResult = await getSmsBalance();

  res.status(200).json({
    success: true,
    message: 'Tabaarak SMS Gateway status retrieved',
    data: balanceResult,
  });
});

export const testSmsGateway = asyncHandler(async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'Both phone and message are required for test SMS',
    });
  }

  const { sendSms } = await import('../integrations/sms/sms.service.js');
  const result = await sendSms({ recipient: phone, message });

  res.status(200).json({
    success: result.success,
    message: result.success ? 'Test SMS processed successfully' : (result.error || 'Failed to send test SMS'),
    data: result,
  });
});

