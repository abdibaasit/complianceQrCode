import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as orgService from '../services/organization.service.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { generateTemporaryPassword } from '../utils/tokenGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../services/audit.service.js';

export const createOrganizationUser = asyncHandler(async (req, res) => {
  const result = await orgService.createOrganizationUser(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Organization user created successfully',
    data: result,
  });
});

export const updateOrganizationUser = asyncHandler(async (req, res) => {
  const user = await OrganizationUser.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'Organization user not found');
  }

  await logAudit({
    actorId: req.user._id,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'ORGANIZATION_USER_UPDATED',
    resourceType: 'OrganizationUser',
    resourceId: user._id,
    metadata: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Organization user updated successfully',
    data: { user },
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await OrganizationUser.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'Organization user not found');
  }

  const temporaryPassword = generateTemporaryPassword();
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(temporaryPassword, salt);
  user.mustChangePassword = true;
  await user.save();

  await logAudit({
    actorId: req.user._id,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'USER_PASSWORD_RESET',
    resourceType: 'OrganizationUser',
    resourceId: user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
    data: {
      temporaryPassword,
      username: user.username,
    },
  });
});
