import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { AITool } from '../types/database';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ShareButton from '../components/ui/ShareButton';
import AuthGuard from '../components/auth/AuthGuard';

const ToolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        if (!id) {
          throw new Error('Tool ID is required');
        }

        const { data, error } = await supabase
          .from('ai_tools')
          .select(`
            *,
            category:category_id(*),
            created_by_user:created_by(first_name, last_name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Tool not found');

        setTool(data);
      } catch (err) {
        console.error('Error fetching tool:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tool');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const handleVisitTool = () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/tools/${id}` } });
      return;
    }
    
    if (tool?.url) {
      window.open(tool.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || 'Tool not found'}</p>
        <button
          onClick={() => navigate('/tools')}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/tools" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 md:h-80 bg-gray-200 relative">
            {tool.image_url ? (
              <img
                src={tool.image_url}
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600">
                <h1 className="text-4xl font-bold text-white">{tool.name}</h1>
              </div>
            )}
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
              
              <div className="flex items-center gap-4">
                {tool.category && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tool.category.name}
                  </span>
                )}
                <ShareButton
                  url={`/tools/${tool.id}`}
                  title={tool.name}
                  description={tool.description}
                  type="tool"
                />
              </div>
            </div>
            
            {tool.url && (
              user ? (
                <button
                  onClick={handleVisitTool}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mb-6"
                >
                  Visit Tool
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <div className="mb-6">
                  <AuthGuard action="visit this tool" redirectTo={`/tools/${tool.id}`}>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md">
                      Visit Tool
                    </button>
                  </AuthGuard>
                </div>
              )
            )}
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8 gap-x-6 gap-y-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Added on {new Date(tool.created_at).toLocaleDateString()}
              </div>
              
              {tool.created_by_user && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Added by {tool.created_by_user.first_name} {tool.created_by_user.last_name}
                </div>
              )}
            </div>
            
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{tool.description}</p>
              
              {tool.how_to_use && (
                user ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">How to Use</h2>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 whitespace-pre-line">
                      {tool.how_to_use}
                    </div>
                  </>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">How to Use</h2>
                    <AuthGuard action="view usage instructions" redirectTo={`/tools/${tool.id}`}>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        Usage instructions available after login
                      </div>
                    </AuthGuard>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-purple-50 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need help with this tool?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Our mentors can provide personalized guidance on how to use this tool effectively for your specific needs.
          </p>
          <Link
            to="/request-help"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Request Mentorship
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailPage;