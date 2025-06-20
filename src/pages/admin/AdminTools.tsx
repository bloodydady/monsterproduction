import React, { useState, useEffect } from 'react';
import { supabase } from '../../App';
import { AITool, Category } from '../../types/database';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Search, Filter, Plus, Edit2, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminTools: React.FC = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    url: '',
    imageUrl: '',
    howToUse: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch tools with category
      const { data: toolsData, error: toolsError } = await supabase
        .from('ai_tools')
        .select(`
          *,
          category:category_id(*)
        `)
        .order('name');

      if (toolsError) throw toolsError;
      setTools(toolsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTool) {
        // Update existing tool
        const { error } = await supabase
          .from('ai_tools')
          .update({
            name: formData.name,
            description: formData.description,
            category_id: formData.categoryId,
            url: formData.url || null,
            image_url: formData.imageUrl || null,
            how_to_use: formData.howToUse || null,
            is_featured: formData.isFeatured,
          })
          .eq('id', editingTool.id);

        if (error) throw error;
        toast.success('Tool updated successfully');
      } else {
        // Create new tool
        const { error } = await supabase
          .from('ai_tools')
          .insert({
            name: formData.name,
            description: formData.description,
            category_id: formData.categoryId,
            url: formData.url || null,
            image_url: formData.imageUrl || null,
            how_to_use: formData.howToUse || null,
            is_featured: formData.isFeatured,
          });

        if (error) throw error;
        toast.success('Tool created successfully');
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        url: '',
        imageUrl: '',
        howToUse: '',
        isFeatured: false,
      });
      setEditingTool(null);
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error('Failed to save tool');
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;
      
      setTools(tools.filter(tool => tool.id !== toolId));
      toast.success('Tool deleted successfully');
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    }
  };

  const handleEdit = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      categoryId: tool.category_id,
      url: tool.url || '',
      imageUrl: tool.image_url || '',
      howToUse: tool.how_to_use || '',
      isFeatured: tool.is_featured,
    });
    setShowAddModal(true);
  };

  const toggleFeatured = async (tool: AITool) => {
    try {
      const { error } = await supabase
        .from('ai_tools')
        .update({ is_featured: !tool.is_featured })
        .eq('id', tool.id);

      if (error) throw error;
      
      setTools(tools.map(t => 
        t.id === tool.id ? { ...t, is_featured: !t.is_featured } : t
      ));
      
      toast.success(`Tool ${tool.is_featured ? 'removed from' : 'added to'} featured list`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || tool.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

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
        <div className="mb-8">
          <Link 
            to="/admin"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage AI Tools</h1>
          <p className="text-gray-600">Add and manage AI tools in the directory</p>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingTool(null);
                  setFormData({
                    name: '',
                    description: '',
                    categoryId: '',
                    url: '',
                    imageUrl: '',
                    howToUse: '',
                    isFeatured: false,
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Tool
              </button>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {tool.image_url ? (
                  <img
                    src={tool.image_url}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600">
                    <span className="text-white text-2xl font-bold">{tool.name.charAt(0)}</span>
                  </div>
                )}
                {tool.category && (
                  <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {tool.category.name}
                  </span>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{tool.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(tool)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(tool)}
                      className={`${
                        tool.is_featured ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {tool.url && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Visit Tool
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingTool ? 'Edit Tool' : 'Add New Tool'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category*
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How to Use
                      </label>
                      <textarea
                        value={formData.howToUse}
                        onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                        Feature this tool
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      {editingTool ? 'Update Tool' : 'Add Tool'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTools;