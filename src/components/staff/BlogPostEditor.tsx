
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  X, 
  Upload, 
  Bold, 
  Italic, 
  List, 
  Link,
  Image as ImageIcon,
  Calendar,
  Tag,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPostEditorProps {
  postId?: string | null;
  onClose: () => void;
}

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author_name: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  scheduled_at?: string;
  meta_title?: string;
  meta_description?: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ postId, onClose }) => {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author_name: 'Admin',
    status: 'draft'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      
      const typedPost: BlogPost = {
        ...data,
        status: (data.status as 'draft' | 'published' | 'scheduled') || 'draft'
      };
      setPost(typedPost);
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Error loading post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSave = async (status?: 'draft' | 'published' | 'scheduled') => {
    if (!post.title.trim()) {
      alert('Please enter a title for the post.');
      return;
    }

    try {
      setSaving(true);
      
      const saveData = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        author_name: post.author_name,
        status: status || post.status,
        published_at: (status === 'published' && !post.published_at) 
          ? new Date().toISOString() 
          : post.published_at,
        scheduled_at: post.scheduled_at,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        category_id: post.category_id
      };

      let result;
      if (postId) {
        result = await supabase
          .from('blog_posts')
          .update(saveData)
          .eq('id', postId)
          .select();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(saveData)
          .select();
      }

      if (result.error) {
        console.error('Error saving post:', result.error);
        alert('Error saving post: ' + result.error.message);
        return;
      }
      
      const statusMessage = status === 'published' ? 'Post published successfully!' : 'Post saved successfully!';
      alert(statusMessage);
      
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setPost(prev => ({ ...prev, featured_image: publicUrl }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const insertContentImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      const imageMarkdown = `![Image](${publicUrl})`;
      setPost(prev => ({ ...prev, content: prev.content + '\n\n' + imageMarkdown }));
      alert('Image uploaded and inserted into content!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const insertContent = (type: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertion = '';
    switch (type) {
      case 'bold':
        insertion = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        insertion = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading':
        insertion = `\n## ${selectedText || 'Heading'}\n`;
        break;
      case 'list':
        insertion = `\n- ${selectedText || 'List item'}\n`;
        break;
      case 'link':
        insertion = `[${selectedText || 'link text'}](url)`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      insertion + 
      textarea.value.substring(end);
    
    setPost(prev => ({ ...prev, content: newContent }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27AE60]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">
                {postId ? 'Edit Post' : 'New Post'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="hover:bg-gray-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving || !post.title.trim()}
                className="bg-[#27AE60] hover:bg-[#219a52]"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                {/* Title */}
                <div className="mb-6">
                  <Input
                    placeholder="Post title..."
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-2xl font-bold border-none p-0 focus:ring-0 placeholder-gray-400"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Slug: /{post.slug}
                  </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertContent('bold')}
                    className="hover:bg-white"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertContent('italic')}
                    className="hover:bg-white"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertContent('heading')}
                    className="hover:bg-white"
                  >
                    H2
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertContent('list')}
                    className="hover:bg-white"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertContent('link')}
                    className="hover:bg-white"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={uploading}
                      className="hover:bg-white"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {uploading && <span className="ml-2">Uploading...</span>}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={insertContentImage}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Content */}
                {previewMode ? (
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
                  </div>
                ) : (
                  <Textarea
                    name="content"
                    placeholder="Write your post content here..."
                    value={post.content}
                    onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[500px] resize-none border-none p-0 focus:ring-0"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={post.status}
                    onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <Input
                    value={post.author_name}
                    onChange={(e) => setPost(prev => ({ ...prev, author_name: e.target.value }))}
                  />
                </div>

                {post.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule Date</label>
                    <Input
                      type="datetime-local"
                      value={post.scheduled_at}
                      onChange={(e) => setPost(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={post.category_id || ''}
                  onChange={(e) => setPost(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60]"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Image URL"
                    value={post.featured_image || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value }))}
                  />
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Brief description of the post..."
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Title</label>
                  <Input
                    placeholder="SEO title"
                    value={post.meta_title || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <Textarea
                    placeholder="SEO description"
                    value={post.meta_description || ''}
                    onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;
