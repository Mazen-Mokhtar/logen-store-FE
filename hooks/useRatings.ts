import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Rating {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment?: {
    en?: string;
    ar?: string;
  };
  isVerifiedPurchase: boolean;
  helpfulVotes: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateRatingData {
  productId: string;
  rating: number;
  comment?: {
    en?: string;
    ar?: string;
  };
}

export interface UpdateRatingData {
  rating?: number;
  comment?: {
    en?: string;
    ar?: string;
  };
}

export interface RatingFilters {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  rating?: number;
  verifiedOnly?: boolean;
}

// API functions
const API_BASE = '/api/ratings';

async function fetchProductRatings(productId: string, filters: RatingFilters = {}) {
  // Only try to get auth token on client side
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // Use absolute URL for server-side requests
  const baseUrl = typeof window !== 'undefined' 
    ? '' 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const { page = 1, limit = 10, sortBy, sortOrder, rating, verifiedOnly } = filters;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (rating) queryParams.append('rating', rating.toString());
  if (verifiedOnly !== undefined) queryParams.append('verifiedOnly', verifiedOnly.toString());
  
  const url = `${baseUrl}${API_BASE}/product/${productId}/ratings?${queryParams.toString()}`;
  
  console.log('🚀 Fetching ratings for product:', productId);
  console.log('🔗 Request URL:', url);
  console.log('📄 Filters:', filters);
  console.log('🔑 Auth Token:', authToken ? 'Available' : 'Not available');
  console.log('🌐 Environment:', typeof window !== 'undefined' ? 'Client' : 'Server');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    // Add cache control for better SSR performance
    cache: typeof window !== 'undefined' ? 'default' : 'no-store'
  });
  
  console.log('📡 Response status:', response.status);
  console.log('📡 Response ok:', response.ok);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch ratings - Response not OK:', response.status, response.statusText);
    throw new Error('Failed to fetch product ratings');
  }
  
  const result = await response.json();
  console.log('📊 Ratings result:', result);
  
  // Handle backend response structure
  return result.data || result;
}

async function fetchProductRatingStats(productId: string) {
  // Only try to get auth token on client side
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // Use absolute URL for server-side requests
  const baseUrl = typeof window !== 'undefined' 
    ? '' 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const url = `${baseUrl}${API_BASE}/product/${productId}/stats`;
  
  console.log('🚀 Fetching rating stats for product:', productId);
  console.log('🔗 Request URL:', url);
  console.log('🔑 Auth Token:', authToken ? 'Available' : 'Not available');
  console.log('🌐 Environment:', typeof window !== 'undefined' ? 'Client' : 'Server');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    // Add cache control for better SSR performance
    cache: typeof window !== 'undefined' ? 'default' : 'no-store'
  });
  
  console.log('📡 Response status:', response.status);
  console.log('📡 Response ok:', response.ok);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch rating stats - Response not OK:', response.status, response.statusText);
    throw new Error('Failed to fetch product rating stats');
  }
  
  const result = await response.json();
  console.log('📊 Rating stats result:', result);
  
  // Handle backend response structure
  return result.data || result;
}

async function createRating(data: CreateRatingData, token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to create rating');
  }
  
  const result = await response.json();
  // Handle backend response structure
  return result.data || result;
}

async function updateRating(ratingId: string, data: UpdateRatingData, token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  const response = await fetch(`${API_BASE}/${ratingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to update rating');
  }
  
  const result = await response.json();
  // Handle backend response structure
  return result.data || result;
}

async function deleteRating(ratingId: string, token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  const response = await fetch(`${API_BASE}/${ratingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to delete rating');
  }
  
  const result = await response.json();
  // Handle backend response structure
  return result.data || result;
}

async function addHelpfulVote(ratingId: string, token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  const response = await fetch(`${API_BASE}/helpful-vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    body: JSON.stringify({ ratingId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to add helpful vote');
  }
  
  const result = await response.json();
  // Handle backend response structure
  return result.data || result;
}

async function removeHelpfulVote(ratingId: string, token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  const response = await fetch(`${API_BASE}/helpful-vote`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    },
    body: JSON.stringify({ ratingId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to remove helpful vote');
  }
  
  const result = await response.json();
  // Handle backend response structure
  return result.data || result;
}

// Custom hooks
export function useProductRatings(productId: string, filters: RatingFilters = {}) {
  // Ensure filters have proper default values and types
  const normalizedFilters = {
    page: Number(filters.page) || 1,
    limit: Number(filters.limit) || 10,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    rating: filters.rating ? Number(filters.rating) : undefined,
    verifiedOnly: filters.verifiedOnly
  };

  return useQuery({
    queryKey: ['productRatings', productId, normalizedFilters],
    queryFn: () => fetchProductRatings(productId, normalizedFilters),
    enabled: !!productId && typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    // Ensure SSR compatibility
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useProductRatingStats(productId: string) {
  return useQuery({
    queryKey: ['productRatingStats', productId],
    queryFn: () => fetchProductRatingStats(productId),
    enabled: !!productId && typeof window !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    // Ensure SSR compatibility
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, token }: { data: CreateRatingData; token?: string }) =>
      createRating(data, token),
    onSuccess: (_, variables) => {
      // Invalidate and refetch product ratings
      queryClient.invalidateQueries({
        queryKey: ['productRatings', variables.data.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ['productRatingStats', variables.data.productId],
      });
    },
  });
}

export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, data, token }: { ratingId: string; data: UpdateRatingData; token?: string }) =>
      updateRating(ratingId, data, token),
    onSuccess: () => {
      // Invalidate all rating queries
      queryClient.invalidateQueries({ queryKey: ['productRatings'] });
      queryClient.invalidateQueries({ queryKey: ['productRatingStats'] });
    },
  });
}

export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, token }: { ratingId: string; token?: string }) =>
      deleteRating(ratingId, token),
    onSuccess: () => {
      // Invalidate all rating queries
      queryClient.invalidateQueries({ queryKey: ['productRatings'] });
      queryClient.invalidateQueries({ queryKey: ['productRatingStats'] });
    },
  });
}

export function useHelpfulVote() {
  const queryClient = useQueryClient();

  const addVote = useMutation({
    mutationFn: ({ ratingId, token }: { ratingId: string; token?: string }) =>
      addHelpfulVote(ratingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productRatings'] });
    },
  });

  const removeVote = useMutation({
    mutationFn: ({ ratingId, token }: { ratingId: string; token?: string }) =>
      removeHelpfulVote(ratingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productRatings'] });
    },
  });

  return { 
    addVote, 
    removeVote,
    isPending: addVote.isPending || removeVote.isPending
  };
}

// Utility hook for rating calculations
export function useRatingUtils() {
  const calculateAverageRating = (ratings: Rating[]): number => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getRatingDistribution = (ratings: Rating[]): RatingStats['ratingDistribution'] => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatRatingDate = (dateString: string, locale: string = 'en'): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return {
    calculateAverageRating,
    getRatingDistribution,
    formatRatingDate,
  };
}