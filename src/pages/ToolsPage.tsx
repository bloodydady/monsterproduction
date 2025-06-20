import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ExternalLink, PenTool as ToolIcon } from 'lucide-react';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { AITool, Category } from '../types/database';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ShareButton from '../components/ui/ShareButton';
import AuthGuard from '../components/auth/AuthGuard';
import LazyImage from '../components/ui/LazyImage';
import { useDebounce } from '../hooks/useDebounce';
import { throttle } from '../utils/performance';

const ToolsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.all for parallel requests
        const [categoriesResponse, toolsResponse] = await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .order('name'),
          supabase
            .from('ai_tools')
            .select(`
              id,
              name,
              description,
              category_id,
              url,
              image_url,
              is_featured,
              created_at,
              category:category_id(id, name, icon)
            `)
            .order('name')
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (toolsResponse.error) throw toolsResponse.error;

        setCategories(categoriesResponse.data || []);
        setTools(toolsResponse.data || []);
      } catch (error) {
        console.error('Error fetching tools data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize filtered tools for better performance
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = debouncedSearchTerm === '' || 
        tool.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        tool.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || tool.category_id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchTerm, selectedCategory, tools]);

  // Throttled handlers for better performance
  const handleToolClick = useCallback(throttle((toolId: string) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/tools/${toolId}` } });
      return;
    }
    navigate(`/tools/${toolId}`);
  }, 100), [user, navigate]);

  const handleExternalLink = useCallback(throttle((url: string) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/tools' } });
      return;
    }
    window.open(url, '_blank');
  }, 100), [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">AI Tools Directory</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover curated AI tools for hackathons, business growth, learning, and workshops.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for tools..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative flex-shrink-0 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <ToolIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tools found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {tool.image_url ? (
                    <LazyImage
                      src={tool.image_url}
                      alt={tool.name}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600">
                      <ToolIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {tool.category && (
                    <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {tool.category.name}
                    </span>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold flex-1">{tool.name}</h3>
                    <ShareButton
                      url={`/tools/${tool.id}`}
                      title={tool.name}
                      description={tool.description}
                      type="tool"
                    />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {user ? (
                      <button
                        onClick={() => handleToolClick(tool.id)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View Details
                      </button>
                    ) : (
                      <AuthGuard action="view tool details" redirectTo={`/tools/${tool.id}`}>
                        <span className="text-gray-400">View Details (Login Required)</span>
                      </AuthGuard>
                    )}
                    
                    {tool.url && (
                      user ? (
                        <button
                          onClick={() => handleExternalLink(tool.url!)}
                          className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </button>
                      ) : (
                        <span className="inline-flex items-center text-gray-400">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit (Login Required)
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;