
import React, { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import WriteReviewForm from './WriteReviewForm';

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { reviews, stats, loading, deleteReview } = useReviews(productId);
  const { user } = useAuth();

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(reviewId);
    }
  };

  if (showWriteReview) {
    return (
      <WriteReviewForm 
        productId={productId}
        onCancel={() => setShowWriteReview(false)}
        onSubmit={() => {
          setShowWriteReview(false);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          {renderStars(Math.floor(stats.averageRating), 'lg')}
          <div>
            <span className="text-3xl font-bold text-[#111]">
              {stats.averageRating > 0 ? stats.averageRating : 'No reviews'}
            </span>
            {stats.averageRating > 0 && (
              <span className="text-gray-600 ml-2">out of 5</span>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
        </p>
        
        {/* Rating Distribution */}
        {stats.totalReviews > 0 && (
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-3">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="w-8 text-gray-600">{stats.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          onClick={() => setShowWriteReview(true)}
          className="mt-4 bg-black text-white hover:bg-white hover:text-black hover:border-black border-2 border-transparent rounded-lg transition-all duration-200"
        >
          Write a Review
        </Button>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-medium text-[#111]">{review.reviewer_name}</h4>
                    {user && user.id === review.user_id && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete your review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
