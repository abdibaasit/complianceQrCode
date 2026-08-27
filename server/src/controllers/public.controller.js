import { asyncHandler } from '../utils/asyncHandler.js';
import * as submissionService from '../services/submission.service.js';

export const getPublicOrgByToken = asyncHandler(async (req, res) => {
  const result = await submissionService.getPublicOrgByQrToken(req.params.token);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const submitComplaintOrFeedback = asyncHandler(async (req, res) => {
  const result = await submissionService.createPublicSubmission(req.body);
  res.status(201).json({
    success: true,
    message: result.type === 'COMPLAINT'
      ? 'Cabashadaada si guul leh ayaa loo gudbiyay (Complaint submitted successfully).'
      : 'Taladaada si guul leh ayaa loo gudbiyay (Feedback submitted successfully).',
    data: result,
  });
});
