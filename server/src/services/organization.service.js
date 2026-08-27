import bcrypt from 'bcryptjs';
import { Organization } from '../models/Organization.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { QRCode } from '../models/QRCode.js';
import { Subscription } from '../models/Subscription.js';
import { createQrForOrganization } from './qr.service.js';
import { startInitialSubscription, calculateSubscriptionStatus } from './subscription.service.js';
import { generateTemporaryPassword } from '../utils/tokenGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';
import { PlatformSettings } from '../models/PlatformSettings.js';

/**
 * Step 1: Create Organization record
 */
export const createOrganization = async (orgData, logoPath = '', adminUser) => {
  const settings = (await PlatformSettings.findOne()) || {};
  const categories = orgData.complaintCategories && orgData.complaintCategories.length > 0
    ? orgData.complaintCategories
    : settings.defaultComplaintCategories || ['Service', 'Staff', 'Cleanliness', 'Food', 'Security', 'Facilities', 'Payment', 'Other'];

  const organization = await Organization.create({
    ...orgData,
    logo: logoPath || orgData.logo || '',
    complaintCategories: categories,
  });

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_CREATED',
    resourceType: 'Organization',
    resourceId: organization._id,
    metadata: { name: organization.name, type: organization.organizationType },
  });

  return organization;
};

/**
 * Step 2: Create Organization User for the organization
 */
export const createOrganizationUser = async (organizationId, userData, adminUser) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  const cleanUsername = userData.username.toLowerCase().trim();
  const existingUser = await OrganizationUser.findOne({ username: cleanUsername });
  if (existingUser) {
    throw new ApiError(409, 'Username is already taken');
  }

  // Generate temporary password if not explicitly supplied
  const tempPassword = userData.password || generateTemporaryPassword();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(tempPassword, salt);

  const orgUser = await OrganizationUser.create({
    organizationId,
    fullName: userData.fullName,
    username: cleanUsername,
    phone: userData.phone,
    passwordHash,
    mustChangePassword: true,
    status: 'ACTIVE',
  });

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_USER_CREATED',
    resourceType: 'OrganizationUser',
    resourceId: orgUser._id,
    metadata: { organizationId, username: orgUser.username },
  });

  return {
    user: {
      id: orgUser._id,
      fullName: orgUser.fullName,
      username: orgUser.username,
      phone: orgUser.phone,
      organizationId: orgUser.organizationId,
    },
    temporaryPassword: tempPassword,
  };
};

/**
 * Complete Guided Wizard: Creates Org + OrgUser + Generates QR + Starts 30-day subscription in one unified transaction/workflow.
 */
export const createCompleteOrganization = async ({ orgData, userData, logoPath }, adminUser) => {
  // 1. Create Organization
  const organization = await createOrganization(orgData, logoPath, adminUser);

  // 2. Create Org User
  const userResult = await createOrganizationUser(organization._id, userData, adminUser);

  // 3. Generate QR Code
  const qrCode = await createQrForOrganization(organization._id, adminUser);

  // 4. Start 30-Day Service Period
  const subscription = await startInitialSubscription(organization._id, 30);

  return {
    organization,
    user: userResult.user,
    temporaryPassword: userResult.temporaryPassword,
    qrCode,
    subscription,
  };
};

/**
 * List organizations with filtering, pagination, and real-time subscription status.
 */
export const getOrganizationsList = async ({ search, type, status, page = 1, limit = 10 }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { displayTitle: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (type) query.organizationType = type;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [total, organizations] = await Promise.all([
    Organization.countDocuments(query),
    Organization.find(query)
      .populate('activeQrId')
      .populate('activeSubscriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const settings = (await PlatformSettings.findOne()) || {};

  // Enrich with dynamic calculated subscription days
  const enriched = organizations.map((org) => {
    const sub = org.activeSubscriptionId;
    const subCalc = calculateSubscriptionStatus(sub, settings);
    return {
      ...org.toObject(),
      subscriptionStatus: subCalc.status,
      daysRemaining: subCalc.daysRemaining,
      isServiceActive: subCalc.isServiceActive,
      serviceEndDate: subCalc.endDate,
    };
  });

  return {
    organizations: enriched,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single organization details with full relationship context.
 */
export const getOrganizationById = async (id) => {
  const organization = await Organization.findById(id)
    .populate('activeQrId')
    .populate('activeSubscriptionId');

  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  const [orgUser, settings] = await Promise.all([
    OrganizationUser.findOne({ organizationId: id }).select('-passwordHash'),
    PlatformSettings.findOne(),
  ]);

  const subCalc = calculateSubscriptionStatus(organization.activeSubscriptionId, settings || {});

  return {
    organization: {
      ...organization.toObject(),
      subscriptionStatus: subCalc.status,
      daysRemaining: subCalc.daysRemaining,
      isServiceActive: subCalc.isServiceActive,
      serviceEndDate: subCalc.endDate,
    },
    user: orgUser,
  };
};

/**
 * Update organization information (Admin only).
 */
export const updateOrganization = async (id, updateData, logoPath = null, adminUser) => {
  const org = await Organization.findById(id);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  if (logoPath) {
    updateData.logo = logoPath;
  }

  const updatedOrg = await Organization.findByIdAndUpdate(id, updateData, { new: true })
    .populate('activeQrId')
    .populate('activeSubscriptionId');

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_UPDATED',
    resourceType: 'Organization',
    resourceId: id,
    metadata: updateData,
  });

  return updatedOrg;
};
