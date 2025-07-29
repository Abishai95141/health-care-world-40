import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  User, 
  Star, 
  MessageCircle, 
  Share2, 
  ArrowLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import RecommendedProducts from '@/components/RecommendedProducts';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  published_at: string;
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  category?: {
    name: string;
    slug: string;
  };
  tags?: Array<{ name: string; slug: string; }>;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  published_at: string;
  content: string;
  view_count: number;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trackView } = useInteractionTracking();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      loadComments();
      loadRelatedPosts();
      updateViewCount();
      
      // Track blog post view
      const postTags = post.tags?.map(tag => tag.name) || [];
      trackView(post.id, 'blog', postTags);
    }
  }, [post, trackView]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setPost({
        ...data,
        category: data.blog_categories
      });
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!post?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', post.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadRelatedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, author_name, published_at, content, view_count')
        .eq('status', 'published')
        .neq('id', post?.id)
        .limit(3);

      if (error) throw error;
      
      const typedRelatedPosts: RelatedPost[] = (data || []).map(item => ({
        ...item,
        content: item.content || '',
        view_count: item.view_count || 0
      }));
      
      setRelatedPosts(typedRelatedPosts);
    } catch (error) {
      console.error('Error loading related posts:', error);
    }
  };

  const updateViewCount = async () => {
    if (!post) return;
    
    try {
      await supabase
        .from('blog_posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', post.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const submitComment = async () => {
    if (!comment.trim() || !commentAuthor.trim() || !post) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: post.id,
          author_name: commentAuthor,
          content: comment,
          rating: rating,
          status: 'pending'
        });

      if (error) throw error;

      setComment('');
      setCommentAuthor('');
      setRating(0);
      
      alert('Comment submitted for review!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleProductClick = (productSlug: string) => {
    navigate(`/product/${productSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>{post.meta_title || post.title}</title>
      <meta name="description" content={post.meta_description || post.excerpt} />
      
      <div className="min-h-screen bg-white">
        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button 
                onClick={() => navigate('/')}
                className="hover:text-[#27AE60] transition-colors"
              >
                Home
              </button>
              <ChevronRight className="h-4 w-4" />
              <button 
                onClick={() => navigate('/blog')}
                className="hover:text-[#27AE60] transition-colors"
              >
                Blog
              </button>
              {post.category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-[#27AE60]">{post.category.name}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Back Button */}
              <Button 
                variant="outline" 
                onClick={() => navigate('/blog')}
                className="mb-6 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>

              {/* Article Header */}
              <div className="mb-8 animate-fade-in">
                {post.category && (
                  <Badge className="bg-[#27AE60] hover:bg-[#219a52] text-white mb-4">
                    {post.category.name}
                  </Badge>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count} views</span>
                  </div>
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="mb-8 animate-scale-in">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-12 animate-fade-in">
                <div 
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {post.content}
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag.slug} variant="outline" className="hover:bg-gray-50">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Related Products Section */}
              <div className="lg:hidden mb-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Related Products</h3>
                    <RecommendedProducts 
                      context="blog" 
                      tags={post.tags?.map(tag => tag.name) || []} 
                      limit={6}
                      className="grid grid-cols-2 gap-3"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Comments ({comments.length})
                </h3>

                {/* Comment Form */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Leave a Comment</h4>
                    
                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Rate this article</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-2xl focus:outline-none"
                          >
                            <Star 
                              className={`h-6 w-6 ${
                                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        placeholder="Your name"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                      />
                    </div>
                    
                    <Textarea
                      placeholder="Your comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="mb-4"
                    />
                    
                    <Button 
                      onClick={submitComment}
                      className="bg-[#27AE60] hover:bg-[#219a52]"
                      disabled={!comment.trim() || !commentAuthor.trim()}
                    >
                      Submit Comment
                    </Button>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map(comment => (
                    <Card key={comment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-semibold">{comment.author_name}</h5>
                            <p className="text-sm text-gray-600">{formatDate(comment.created_at)}</p>
                          </div>
                          {comment.rating > 0 && (
                            <div className="flex">
                              {[...Array(comment.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Related Products */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Related Products</h3>
                    <RecommendedProducts 
                      context="blog" 
                      tags={post.tags?.map(tag => tag.name) || []} 
                      limit={6}
                      className="grid grid-cols-2 gap-3"
                    />
                  </CardContent>
                </Card>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                      <div className="space-y-4">
                        {relatedPosts.map(relatedPost => (
                          <div
                            key={relatedPost.id}
                            className="group cursor-pointer"
                            onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                          >
                            <div className="flex gap-3">
                              <img
                                src={relatedPost.featured_image || '/placeholder.svg'}
                                alt={relatedPost.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm group-hover:text-[#27AE60] transition-colors line-clamp-2">
                                  {relatedPost.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatDate(relatedPost.published_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
