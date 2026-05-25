import mongoose from 'mongoose';

const practitionerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  practiceAreas: [String],
  barAssociation: String,
  availability: {
    status: { type: String, enum: ['AVAILABLE', 'BUSY', 'OFFLINE'], default: 'AVAILABLE' },
    maxActiveCases: { type: Number, default: 5 }
  },
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED'], default: 'PENDING' }
}, { timestamps: true });

export default mongoose.models.PractitionerProfile || mongoose.model('PractitionerProfile', practitionerProfileSchema);
