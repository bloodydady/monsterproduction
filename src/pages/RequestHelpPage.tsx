import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Plus } from 'lucide-react';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { Category, AITool, Request } from '../types/database';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RequestDetails from '../components/request/RequestDetails';
import toast from 'react-hot-toast';

type RequestType = 'mentorship' | 'hackathon' | 'workshop' | 'business' | 'other';

const RequestHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestType: 'mentorship' as RequestType,
    categoryId: '',
    toolId: '',
  });

  useEffect(() => {
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
        setFilteredTools(toolsData || []);

        // Fetch user's active request if exists
        if (user) {
          const { data: requestData, error: requestError } = await supabase
            .from('requests')
            .select(`
              *,
              user:user_id(*),
              assigned_to_user:assigned_to(*),
              tool:tool_id(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!requestError && requestData) {
            setCurrentRequest(requestData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = tools.filter(tool => tool.category_id === formData.categoryId);
      setFilteredTools(filtered);
    } else {
      setFilteredTools(tools);
    }
  }, [formData.categoryId, tools]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, toolId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a request');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          request_type: formData.requestType,
          tool_id: formData.toolId || null,
          status: 'new',
        })
        .select(`
          *,
          user:user_id(*),
          assigned_to_user:assigned_to(*),
          tool:tool_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      setCurrentRequest(data);
      toast.success('Your request has been submitted successfully!');
      
      setFormData({
        title: '',
        description: '',
        requestType: 'mentorship',
        categoryId: '',
        toolId: '',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setCurrentRequest(null);
    setFormData({
      title: '',
      description: '',
      requestType: 'mentorship',
      categoryId: '',
      toolId: '',
    });
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Request Help</h1>
            <p className="text-xl text-gray-600">
              Submit your request for mentorship, hackathon help, workshop organization, or business growth advice.
            </p>
          </div>

          {currentRequest ? (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleStartNewChat}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Chat
                </button>
              </div>
              <RequestDetails request={currentRequest} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Request Form</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                {/* Request Type */}
                <div className="mb-6">
                  <label htmlFor="requestType" className="block text-gray-700 font-medium mb-2">
                    Request Type*
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="mentorship">Mentorship / AI Tool Guidance</option>
                    <option value="hackathon">Hackathon Coaching</option>
                    <option value="workshop">Workshop Organization</option>
                    <option value="business">Business Growth Advice</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                    Request Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="E.g., Need help with GPT fine-tuning"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                  <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">
                    Category (Optional)
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tool Selection */}
                {formData.categoryId && (
                  <div className="mb-6">
                    <label htmlFor="toolId" className="block text-gray-700 font-medium mb-2">
                      Specific AI Tool (Optional)
                    </label>
                    <select
                      id="toolId"
                      name="toolId"
                      value={formData.toolId}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a tool</option>
                      {filteredTools.map((tool) => (
                        <option key={tool.id} value={tool.id}>
                          {tool.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Please describe what you need help with in detail..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                  >
                    {loading ? <LoadingSpinner size="small\" color="text-white" /> : 'Submit Request'}
                  </button>
                </div>

                {/* Login Notice */}
                {!user && (
                  <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Note: You'll need to log in before submitting this form. Your information will be saved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestHelpPage;