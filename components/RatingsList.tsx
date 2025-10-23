'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Filter, ChevronDown, User, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useProductRatings, useHelpfulVote, useDeleteRating, type Rating, type RatingFilters } from '@/hooks/useRatings';
import { useLocale } from '@/hooks/useLocale';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface RatingsListProps {
  productId: string;
  currentUserId?: string;
  onEditRating?: (rating: Rating) => void;
  className?: string;
}

export function RatingsList({ 
  productId, 
  currentUserId, 
  onEditRating, 
  className = '' 
}: RatingsListProps) {
  const { locale, messages } = useLocale();
  const [filters, setFilters] = useState<RatingFilters>({
    page: 1,
    limit: 10,
    sortBy: 'newest',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRatings, setExpandedRatings] = useState<Set<string>>(new Set());

  const { 
    data: ratingsData, 
    isLoading, 
    error, 
    refetch 
  } = useProductRatings(productId, filters);

  const helpfulVoteMutation = useHelpfulVote();
  const deleteRatingMutation = useDeleteRating();

  const ratings = ratingsData?.ratings || [];
  const totalRatings = ratingsData?.total || ratingsData?.totalCount || ratings.length || 0;
  const hasMore = ratingsData?.hasMore || false;

  const handleFilterChange = (newFilters: Partial<RatingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const loadMore = () => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const handleHelpfulVote = async (ratingId: string, isHelpful: boolean) => {
    try {
      if (isHelpful) {
        await helpfulVoteMutation.addVote.mutateAsync({
          ratingId,
          token: localStorage.getItem('authToken') || undefined
        });
      } else {
        await helpfulVoteMutation.removeVote.mutateAsync({
          ratingId,
          token: localStorage.getItem('authToken') || undefined
        });
      }
      refetch();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm(messages?.confirmDeleteRating || 'Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await deleteRatingMutation.mutateAsync({
        ratingId,
        token: localStorage.getItem('authToken') || undefined
      });
      refetch();
    } catch (error) {
      console.error('Error deleting rating:', error);
    }
  };

  const toggleExpandRating = (ratingId: string) => {
    setExpandedRatings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ratingId)) {
        newSet.delete(ratingId);
      } else {
        newSet.add(ratingId);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return messages?.dateNotAvailable || 'Date not available';
    }
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return messages?.dateNotAvailable || 'Date not available';
    }
    
    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locale === 'ar' ? ar : enUS
      });
    } catch (error) {
      console.warn('Error formatting date:', error, 'dateString:', dateString);
      return messages?.dateNotAvailable || 'Date not available';
    }
  };

  const getCommentText = (comment?: { en?: string; ar?: string }) => {
    if (!comment) return '';
    return comment[locale as keyof typeof comment] || comment.en || comment.ar || '';
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {messages?.errorLoadingRatings || 'Error loading ratings'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {messages?.tryAgain || 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {messages?.customerReviews || 'Customer Reviews'} ({totalRatings})
        </h3>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {messages?.filters || 'Filters'}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {messages?.filterByRating || 'Filter by Rating'}
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => handleFilterChange({ 
                  rating: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{messages?.allRatings || 'All Ratings'}</option>
                <option value="5">5 {messages?.stars || 'Stars'}</option>
                <option value="4">4 {messages?.stars || 'Stars'}</option>
                <option value="3">3 {messages?.stars || 'Stars'}</option>
                <option value="2">2 {messages?.stars || 'Stars'}</option>
                <option value="1">1 {messages?.star || 'Star'}</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {messages?.sortBy || 'Sort By'}
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ 
                  sortBy: e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{messages?.newest || 'Newest'}</option>
                <option value="oldest">{messages?.oldest || 'Oldest'}</option>
                <option value="highest">{messages?.highest || 'Highest Rating'}</option>
                <option value="lowest">{messages?.lowest || 'Lowest Rating'}</option>
                <option value="helpful">{messages?.mostHelpful || 'Most Helpful'}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {messages?.order || 'Order'}
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange({ 
                  sortOrder: e.target.value as 'asc' | 'desc' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">{messages?.descending || 'Descending'}</option>
                <option value="asc">{messages?.ascending || 'Ascending'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {isLoading && ratings.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {messages?.noReviews || 'No reviews yet'}
          </p>
          <p className="text-gray-400">
            {messages?.beFirstToReview || 'Be the first to review this product'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating: Rating) => {
            const isExpanded = expandedRatings.has(rating._id);
            const commentText = getCommentText(rating.comment);
            const isLongComment = commentText.length > 200;
            const displayText = isExpanded || !isLongComment 
              ? commentText 
              : commentText.substring(0, 200) + '...';

            return (
              <div key={rating._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {rating.userName || messages?.anonymousUser || 'Anonymous User'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(rating.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  {currentUserId === rating.userId && (
                    <div className="relative group">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => onEditRating?.(rating)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          {messages?.edit || 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteRating(rating._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          {messages?.delete || 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {renderStars(rating.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {rating.rating}/5
                  </span>
                </div>

                {/* Comment */}
                {commentText && (
                  <div className="mb-4">
                    <p className={`text-gray-700 leading-relaxed ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {displayText}
                    </p>
                    {isLongComment && (
                      <button
                        onClick={() => toggleExpandRating(rating._id)}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 transition-colors"
                      >
                        {isExpanded 
                          ? (messages?.showLess || 'Show Less')
                          : (messages?.showMore || 'Show More')
                        }
                      </button>
                    )}
                  </div>
                )}

                {/* Helpful Votes */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    {messages?.wasThisHelpful || 'Was this helpful?'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHelpfulVote(rating._id, true)}
                      disabled={helpfulVoteMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {rating.helpfulCount || 0}
                    </button>
                    <button
                      onClick={() => handleHelpfulVote(rating._id, false)}
                      disabled={helpfulVoteMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      0
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading 
              ? (messages?.loading || 'Loading...')
              : (messages?.loadMore || 'Load More Reviews')
            }
          </button>
        </div>
      )}
    </div>
  );
}

export default RatingsList;