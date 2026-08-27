import { asyncHandler } from '../utils/asyncHandler.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { logAudit } from '../services/audit.service.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }

  res.status(200).json({
    success: true,
    data: { settings },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create(req.body);
  } else {
    settings = await PlatformSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
  }

  await logAudit({
    actorId: req.user._id,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'PLATFORM_SETTINGS_UPDATED',
    resourceType: 'PlatformSettings',
    resourceId: settings._id,
    metadata: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Platform settings updated successfully',
    data: { settings },
  });
});
