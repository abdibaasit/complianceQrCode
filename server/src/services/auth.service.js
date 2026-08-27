import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { ROLES } from '../constants/roles.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

export const generateAuthToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role,
      username: user.username,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
};

export const login = async ({ username, password }, reqInfo = {}) => {
  const cleanUsername = username.toLowerCase().trim();

  // Try Admin user first
  let user = await AdminUser.findOne({ username: cleanUsername });
  let role = ROLES.PLATFORM_ADMIN;

  if (!user) {
    // Try Organization user
    user = await OrganizationUser.findOne({ username: cleanUsername }).populate(
      'organizationId',
      'name displayTitle logo status branch'
    );
    role = ROLES.ORGANIZATION_USER;
  }

  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Check user active status
  if (role === ROLES.PLATFORM_ADMIN && !user.isActive) {
    throw new ApiError(403, 'Admin account has been deactivated');
  }

  if (role === ROLES.ORGANIZATION_USER && user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Organization account is currently inactive or suspended');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAuthToken(user, role);

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: role,
    action: 'USER_LOGIN',
    resourceType: role === ROLES.PLATFORM_ADMIN ? 'AdminUser' : 'OrganizationUser',
    resourceId: user._id,
    ipAddress: reqInfo.ip || '',
    userAgent: reqInfo.userAgent || '',
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      role,
      mustChangePassword: role === ROLES.ORGANIZATION_USER ? user.mustChangePassword : false,
      organization: role === ROLES.ORGANIZATION_USER ? user.organizationId : null,
    },
  };
};

export const changePassword = async (userId, role, { currentPassword, newPassword }) => {
  let user;
  if (role === ROLES.PLATFORM_ADMIN) {
    user = await AdminUser.findById(userId);
  } else {
    user = await OrganizationUser.findById(userId);
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  if (role === ROLES.ORGANIZATION_USER) {
    user.mustChangePassword = false;
  }
  await user.save();

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: role,
    action: 'PASSWORD_CHANGED',
    resourceType: role === ROLES.PLATFORM_ADMIN ? 'AdminUser' : 'OrganizationUser',
    resourceId: user._id,
  });

  return { message: 'Password changed successfully' };
};

export const updateUsername = async (userId, role, newUsername) => {
  const cleanUsername = newUsername.toLowerCase().trim();

  // Check for uniqueness across AdminUser and OrganizationUser
  const existingAdmin = await AdminUser.findOne({ username: cleanUsername });
  const existingOrg = await OrganizationUser.findOne({ username: cleanUsername });

  if (existingAdmin || existingOrg) {
    throw new ApiError(409, 'Username is already taken');
  }

  let user;
  if (role === ROLES.PLATFORM_ADMIN) {
    user = await AdminUser.findByIdAndUpdate(userId, { username: cleanUsername }, { new: true });
  } else {
    user = await OrganizationUser.findByIdAndUpdate(userId, { username: cleanUsername }, { new: true });
  }

  return {
    message: 'Username updated successfully',
    username: user.username,
  };
};
