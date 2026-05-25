import { success } from '../core/utils/apiResponse.js';

export const registerPractitioner = async (req, res) => {
  const { fullName, email, password, phone, nbaBranch, specialization } = req.body;
  const { registerUser } = await import('../auth/auth.service.js');
  const userData = await registerUser({ fullName, email, password, phone, role: 'PRACTITIONER' });
  const PractitionerProfile = (await import('../models/PractitionerProfile.js')).default;
  await PractitionerProfile.create({
    user: userData.user.id,
    practiceAreas: [specialization],
    barAssociation: nbaBranch,
    availability: { status: 'AVAILABLE', maxActiveCases: 5 },
    verificationStatus: 'PENDING'
  });
  return success(res, { ...userData, requiresApproval: true }, 'Practitioner registered');
};
