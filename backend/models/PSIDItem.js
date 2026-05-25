import mongoose from 'mongoose';

const ownershipEntrySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: Date, default: Date.now },
  to: { type: Date, default: null },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, enum: ['REGISTRATION', 'TRANSFER', 'REVERSAL', 'ADMIN_CORRECTION'] },
  transactionReference: String,
  evidenceNote: String,
  reversalRequested: { type: Boolean, default: false }
}, { timestamps: true });

const psidItemSchema = new mongoose.Schema({
  serial: { type: String, required: true, unique: true, uppercase: true, trim: true },
  propertyType: { type: String, default: 'GENERAL' },
  itemName: { type: String, default: '' },
  ownerName: { type: String, default: '' },
  propertyDetails: {
    brand: { type: String, default: '' },
    model: { type: String, default: '' }
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ACTIVE', 'STOLEN', 'RECOVERED'], default: 'ACTIVE' },
  stolenNote: { type: String, default: '' },
  foundReports: [{
    finderPhone: String,
    location: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reward: {
    offered: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
    public: { type: Boolean, default: false },
    severityLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    platformFeePercent: { type: Number, default: 0 },
    platformFeeAmount: { type: Number, default: 0 },
    netToFinder: { type: Number, default: 0 }
  },
  ownershipHistory: [ownershipEntrySchema]
}, { timestamps: true });

export default mongoose.models.PSIDItem || mongoose.model('PSIDItem', psidItemSchema);
