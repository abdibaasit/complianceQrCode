import { PlatformComplaint } from '../models/PlatformComplaint.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { generateReferenceNumber } from '../utils/referenceNumber.js';
import { logAudit } from '../services/audit.service.js';
import { normalizeSomaliPhone } from '../utils/phone.util.js';

/**
 * Public: Submit a platform complaint
 */
export const submitPlatformComplaint = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, category, message, suggestedSolution } = req.body;

  if (!message || message.trim().length < 3) {
    throw new ApiError(400, 'Complaint message must be at least 3 characters long');
  }

  if (message.trim().length > 200) {
    throw new ApiError(400, 'Message cannot exceed 200 characters');
  }

  if (suggestedSolution && suggestedSolution.trim().length > 200) {
    throw new ApiError(400, 'Suggested solution cannot exceed 200 characters');
  }

  const cleanPhone = normalizeSomaliPhone(customerPhone);
  const referenceNumber = `PLC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const complaint = await PlatformComplaint.create({
    referenceNumber,
    customerName: customerName ? customerName.trim() : 'Anonymous',
    customerPhone: cleanPhone,
    category: category ? category.trim() : 'Platform Support',
    message: message.trim(),
    suggestedSolution: suggestedSolution ? suggestedSolution.trim() : '',
    status: 'NEW',
  });

  res.status(201).json({
    success: true,
    message: 'Cabashadaada ku saabsan nidaamka Compliance QR si guul leh ayaa loo diray.',
    data: {
      id: complaint._id,
      referenceNumber: complaint.referenceNumber,
      category: complaint.category,
      submittedAt: complaint.createdAt,
    },
  });
});

/**
 * Super Admin: List platform complaints
 */
export const getPlatformComplaints = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { referenceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [total, complaints] = await Promise.all([
    PlatformComplaint.countDocuments(query),
    PlatformComplaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
  ]);

  res.status(200).json({
    success: true,
    message: 'Platform complaints retrieved successfully',
    data: complaints,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * Super Admin: Update platform complaint status
 */
export const updatePlatformComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const complaint = await PlatformComplaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Platform complaint not found');
  }

  if (status) complaint.status = status;
  if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
  if (status === 'RESOLVED' || status === 'CLOSED') {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  await logAudit({
    actorId: req.user.id,
    actorName: req.user.fullName || req.user.username,
    actorRole: req.user.role,
    action: 'PLATFORM_COMPLAINT_UPDATED',
    resourceType: 'PlatformComplaint',
    resourceId: complaint._id,
    metadata: { status, referenceNumber: complaint.referenceNumber },
  });

  res.status(200).json({
    success: true,
    message: 'Platform complaint updated successfully',
    data: complaint,
  });
});
