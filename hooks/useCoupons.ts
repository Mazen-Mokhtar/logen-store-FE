import { useState } from 'react';
import { apiClient, handleApiError } from '@/lib/api';

interface CouponValidationResult {
  isValid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
  };
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

interface CouponDetails {
  code: string;
  name: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  status: {
    isValid: boolean;
    reason: string;
  };
}

export function useCoupons() {
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const validateCoupon = async (
    code: string,
    orderAmount: number
  ): Promise<CouponValidationResult> => {
    if (!code.trim()) {
      return { isValid: false, error: 'Coupon code is required' };
    }

    setValidatingCoupon(true);

    try {
      const result = await apiClient.validateCoupon(code, orderAmount);
      return {
        isValid: true,
        coupon: result.coupon,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
      };
    } catch (err) {
      return {
        isValid: false,
        error: handleApiError(err),
      };
    } finally {
      setValidatingCoupon(false);
    }
  };

  const getCouponDetails = async (code: string): Promise<CouponDetails | null> => {
    if (!code.trim()) return null;

    setFetchingDetails(true);

    try {
      const result = await apiClient.getCouponDetails(code);
      return result;
    } catch (err) {
      console.error('Failed to fetch coupon details:', handleApiError(err));
      return null;
    } finally {
      setFetchingDetails(false);
    }
  };

  return {
    validateCoupon,
    getCouponDetails,
    validatingCoupon,
    fetchingDetails,
  };
}