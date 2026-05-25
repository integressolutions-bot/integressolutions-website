import { HttpError } from '../core/utils/apiResponse.js';

export const ensurePaymentReference = (payload) => {
  if (!payload.paymentReference) {
    if (process.env.NODE_ENV !== 'production') {
      payload.paymentReference = `DUMMY-${Date.now()}`;
    } else {
      throw new HttpError(400, 'Payment reference is required');
    }
  }

  return {
    ...payload,
    payment: {
      ...(payload.payment || {}),
      verified: process.env.NODE_ENV !== 'production'
    }
  };
};
