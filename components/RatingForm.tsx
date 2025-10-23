'use client';

import React, { useState, useEffect } from 'react';
import { Star, Send, X, Edit3 } from 'lucide-react';
import { useCreateRating, useUpdateRating, type CreateRatingData, type UpdateRatingData } from '@/hooks/useRatings';
import { useLocale } from '@/hooks/useLocale';

interface RatingFormProps {
  productId: string;
  existingRating?: {
    _id: string;
    rating: number;
    comment?: {
      en?: string;
      ar?: string;
    };
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function RatingForm({ 
  productId, 
  existingRating, 
  onSuccess, 
  onCancel, 
  className = '' 
}: RatingFormProps) {
  const { locale, messages } = useLocale();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState({
    en: existingRating?.comment?.en || '',
    ar: existingRating?.comment?.ar || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRatingMutation = useCreateRating();
  const updateRatingMutation = useUpdateRating();

  const isEditing = !!existingRating;
  const currentComment = comment[locale as keyof typeof comment] || '';

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment({
        en: existingRating.comment?.en || '',
        ar: existingRating.comment?.ar || ''
      });
    }
  }, [existingRating]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleCommentChange = (value: string) => {
    setComment(prev => ({
      ...prev,
      [locale]: value
    }));
  };

  const validateComment = (commentText: string) => {
    // Check if comment is empty or only whitespace
    const trimmedComment = commentText.trim();
    
    // If comment is provided, it must be between 3-1000 characters
    if (trimmedComment.length > 0 && (trimmedComment.length < 3 || trimmedComment.length > 1000)) {
      return false;
    }
    
    // Check if comment contains valid text (Arabic or English characters)
    if (trimmedComment.length > 0) {
      const validTextRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s\.,!?;:()\-'"]+$/;
      if (!validTextRegex.test(trimmedComment)) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert(messages?.pleaseSelectRating || 'Please select a rating');
      return;
    }

    // Validate comment if provided
    const currentCommentText = currentComment.trim();
    if (currentCommentText.length > 0 && !validateComment(currentCommentText)) {
      alert('comment.Rating content must be valid text between 3-1000 characters in English or Arabic');
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = comment.en || comment.ar ? comment : undefined;
      
      if (isEditing && existingRating) {
        const updateData: UpdateRatingData = {
          rating,
          ...(commentData && { comment: commentData })
        };
        
        const result = await updateRatingMutation.mutateAsync({
          ratingId: existingRating._id,
          data: updateData,
          token: localStorage.getItem('authToken') || undefined
        });
        
        console.log('Rating updated successfully:', result);
      } else {
        const createData: CreateRatingData = {
          productId,
          rating,
          ...(commentData && { comment: commentData })
        };
        
        const result = await createRatingMutation.mutateAsync({
          data: createData,
          token: localStorage.getItem('authToken') || undefined
        });
        
        console.log('Rating created successfully:', result);
      }

      // Reset form
      if (!isEditing) {
        setRating(0);
        setComment({ en: '', ar: '' });
      }
      
      // Call onSuccess callback which will show proper notification
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`p-1 transition-colors duration-200 ${
            i <= displayRating 
              ? 'text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          disabled={isSubmitting}
        >
          <Star 
            className={`w-8 h-8 ${
              i <= displayRating ? 'fill-current' : ''
            }`} 
          />
        </button>
      );
    }

    return stars;
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      en: ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      ar: ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز']
    };
    
    return ratingTexts[locale as keyof typeof ratingTexts]?.[rating] || '';
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing 
            ? (messages?.editRating || 'Edit Rating')
            : (messages?.addRating || 'Add Rating')
          }
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {messages?.rating || 'Rating'} *
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            {(hoveredRating || rating) > 0 && (
              <span className={`text-sm text-gray-600 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                {getRatingText(hoveredRating || rating)}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {messages?.comment || 'Comment'} ({messages?.optional || 'Optional'})
          </label>
          <textarea
            value={currentComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={messages?.commentPlaceholder || 'Share your experience with this product...'}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
            rows={4}
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {messages?.maxCharacters || 'Maximum 1000 characters'}
            </span>
            <span>
              {currentComment.length}/1000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
              rating === 0 || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting 
              ? (messages?.submitting || 'Submitting...')
              : isEditing 
                ? (messages?.updateRating || 'Update Rating')
                : (messages?.submitRating || 'Submit Rating')
            }
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {messages?.cancel || 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default RatingForm;