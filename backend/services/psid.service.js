import PSIDItem from '../models/PSIDItem.js';
import User from '../models/User.js';
import { HttpError } from '../core/utils/apiResponse.js';

const mapItem = (item) => item;

const addOwnershipEntry = async (item, newOwnerId, reason, changedById, evidenceNote = '') => {
  const lastEntry = item.ownershipHistory[item.ownershipHistory.length - 1];
  if (lastEntry && !lastEntry.to) lastEntry.to = new Date();
  item.ownershipHistory.push({
    owner: newOwnerId,
    from: new Date(),
    to: null,
    changedBy: changedById || newOwnerId,
    reason,
    transactionReference: `TRF-${Date.now()}`,
    evidenceNote,
  });
  await item.save();
};

export const registerItem = async (payload, userId) => {
  const serial = (payload.serial || payload.serialNumber || '').toUpperCase().trim();
  if (!serial) throw new HttpError(400, 'Serial is required');
  const existing = await PSIDItem.findOne({ serial });
  if (existing) throw new HttpError(409, 'Serial already registered');
  const item = await PSIDItem.create({
    serial,
    propertyType: payload.propertyType || payload.category || payload.itemName || 'GENERAL',
    itemName: payload.itemName || payload.subCategory || payload.propertyType || 'Item',
    ownerName: payload.owner?.name || payload.ownerName || '',
    propertyDetails: {
      brand: payload.propertyDetails?.brand || payload.brand || '',
      model: payload.propertyDetails?.model || payload.model || ''
    },
    owner: userId
  });
  await addOwnershipEntry(item, userId, 'REGISTRATION', userId);
  return mapItem(item);
};

export const transferItem = async (serial, currentUserId, newOwnerEmail) => {
  const item = await PSIDItem.findOne({ serial: serial.toUpperCase().trim(), owner: currentUserId });
  if (!item) throw new HttpError(404, 'Item not found or you are not the owner');
  const newOwner = await User.findOne({ email: newOwnerEmail.toLowerCase().trim() });
  if (!newOwner) throw new HttpError(404, 'New owner not found. They must register first.');
  await addOwnershipEntry(item, newOwner._id, 'TRANSFER', currentUserId);
  item.owner = newOwner._id;
  await item.save();
  return { serial: item.serial, previousOwner: currentUserId, newOwner: newOwner._id };
};

export const requestReversal = async (serial, previousOwnerId, reason) => {
  const item = await PSIDItem.findOne({ serial: serial.toUpperCase().trim() });
  if (!item) throw new HttpError(404, 'Item not found');
  const lastTransfer = [...item.ownershipHistory].reverse().find((entry) => entry.reason === 'TRANSFER' && entry.owner.toString() !== previousOwnerId.toString() && !entry.reversalRequested);
  if (!lastTransfer) throw new HttpError(404, 'No recent transfer found');
  const gracePeriod = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - new Date(lastTransfer.from).getTime() > gracePeriod) throw new HttpError(403, 'Reversal period expired (7 days).');
  lastTransfer.reversalRequested = true;
  lastTransfer.evidenceNote = reason;
  await item.save();
  return { serial, status: 'REVERSAL_PENDING' };
};

export const approveReversal = async (serial, adminId) => {
  const item = await PSIDItem.findOne({ serial: serial.toUpperCase().trim() });
  if (!item) throw new HttpError(404, 'Item not found');
  const disputedTransfer = item.ownershipHistory.find((entry) => entry.reason === 'TRANSFER' && entry.reversalRequested === true && !entry.to);
  if (!disputedTransfer) throw new HttpError(404, 'No pending reversal');
  const index = item.ownershipHistory.indexOf(disputedTransfer);
  const previousEntry = item.ownershipHistory[index - 1];
  if (!previousEntry) throw new HttpError(400, 'Cannot reverse initial registration');
  await addOwnershipEntry(item, previousEntry.owner, 'REVERSAL', adminId, `Admin approved reversal: ${disputedTransfer.evidenceNote}`);
  item.owner = previousEntry.owner;
  disputedTransfer.to = new Date();
  await item.save();
  return { serial, newOwner: previousEntry.owner };
};
