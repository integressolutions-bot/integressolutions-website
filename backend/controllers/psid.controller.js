import * as service from '../services/psid.service.js';
import { success } from '../core/utils/apiResponse.js';

export const transferOwnership = async (req, res) => success(res, await service.transferItem(req.params.serial, req.user._id, req.body.newOwnerEmail), 'Ownership transferred');
export const requestReversal = async (req, res) => success(res, await service.requestReversal(req.params.serial, req.user._id, req.body.reason), 'Reversal request submitted');
export const approveReversal = async (req, res) => success(res, await service.approveReversal(req.params.serial, req.user._id), 'Reversal approved');
