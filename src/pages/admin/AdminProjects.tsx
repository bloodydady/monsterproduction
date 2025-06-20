import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../App';
import { ArrowLeft, Search, Filter, Eye, Check, X, Star, User } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  live_url?: string;
  github_url?: string;
  completion_date: string;
  user_id: string;
  is_approved: boolean;
  is_featured: boolean;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          user:user_id(first_name, last_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_approved: !currentStatus })
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, is_approved: !currentStatus } : project
      ));
      
      toast.success(`Project ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast.error('Failed to update approval status');
    }
  };

  const handleFeaturedToggle = async (projectId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured: !currentStatus })
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, is_featured: !currentStatus } : project
      ));
      
      toast.success(`Project ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.user && `${project.user.first_name} ${project.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && project.is_approved) ||
      (statusFilter === 'pending' && !project.is_approved) ||
      (statusFilter === 'featured' && project.is_featured);
    
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold">Manage Community Projects</h1>
          <p className="text-gray-600">Review and moderate user-submitted projects</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{project.title.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {project.is_approved ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {project.is_featured && (
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                
                {project.user && (
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mr-3">
                      {project.user.avatar_url ? (
                        <img
                          src={project.user.avatar_url}
                          alt={`${project.user.first_name} ${project.user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {project.user.first_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {project.user.first_name} {project.user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{project.user.email}</p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {project.live_url && (
                      <button
                        onClick={() => window.open(project.live_url!, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Live Project"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleApprovalToggle(project.id, project.is_approved)}
                      className={`${
                        project.is_approved ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={project.is_approved ? 'Unapprove' : 'Approve'}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleFeaturedToggle(project.id, project.is_featured)}
                      className={`${
                        project.is_featured ? 'text-purple-600 hover:text-purple-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={project.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Project"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(project.completion_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;