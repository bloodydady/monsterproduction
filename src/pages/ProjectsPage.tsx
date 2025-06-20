import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { Calendar, Link as LinkIcon, Github, Plus, Edit2, Trash2, Eye, Upload, Check, X } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ShareButton from '../components/ui/ShareButton';
import AuthGuard from '../components/auth/AuthGuard';
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
  user_id?: string;
  is_approved: boolean;
  is_featured: boolean;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    completionDate: '',
  });

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          user:user_id(first_name, last_name, avatar_url)
        `)
        .eq('is_approved', true)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProjects(data || []);
    } catch (error) {
      console.error('Error fetching user projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);

    try {
      const projectData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies.split(',').map(tech => tech.trim()),
        image_url: formData.imageUrl || null,
        live_url: formData.liveUrl || null,
        github_url: formData.githubUrl || null,
        completion_date: formData.completionDate,
        is_approved: false, // Requires admin approval
        is_featured: false,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Project updated successfully! It will be reviewed for approval.');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData);

        if (error) throw error;
        toast.success('Project uploaded successfully! It will be reviewed for approval.');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        technologies: '',
        imageUrl: '',
        liveUrl: '',
        githubUrl: '',
        completionDate: '',
      });
      setShowUploadModal(false);
      setEditingProject(null);
      
      // Refresh data
      fetchUserProjects();
      fetchProjects();
    } catch (error) {
      console.error('Error uploading project:', error);
      toast.error('Failed to upload project. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      imageUrl: project.image_url || '',
      liveUrl: project.live_url || '',
      githubUrl: project.github_url || '',
      completionDate: project.completion_date,
    });
    setShowUploadModal(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      toast.success('Project deleted successfully');
      fetchUserProjects();
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleViewProject = (project: Project) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/projects' } });
      return;
    }

    if (project.live_url) {
      window.open(project.live_url, '_blank');
    }
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Community Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore innovative projects created by our community members and share your own work.
          </p>
        </div>

        {/* Upload Section for Authenticated Users */}
        {user ? (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setFormData({
                    title: '',
                    description: '',
                    technologies: '',
                    imageUrl: '',
                    liveUrl: '',
                    githubUrl: '',
                    completionDate: '',
                  });
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Project
              </button>
            </div>

            {/* User's Projects */}
            {userProjects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center mb-12">
                <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
                <p className="text-gray-500 mb-4">Upload your first project to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {userProjects.map((project) => (
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
                            Pending Review
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
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          Completed: {new Date(project.completion_date).toLocaleDateString()}
                        </div>

                        {project.live_url && (
                          <div className="flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <button
                              onClick={() => window.open(project.live_url!, '_blank')}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              Live Demo
                            </button>
                          </div>
                        )}

                        {project.github_url && (
                          <div className="flex items-center">
                            <Github className="w-4 h-4 mr-2 text-gray-500" />
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800"
                            >
                              GitHub Repository
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Project"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Project"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-12">
            <AuthGuard action="upload projects" redirectTo="/projects">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Share Your Projects</h3>
                <p className="text-gray-500">Login to upload your projects and showcase your work!</p>
              </div>
            </AuthGuard>
          </div>
        )}

        {/* Community Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Community Projects</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Available</h3>
              <p className="text-gray-500">Be the first to share your project with the community!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
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
                    {project.is_featured && (
                      <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold flex-1">{project.title}</h3>
                      <ShareButton
                        url={`/projects#${project.id}`}
                        title={project.title}
                        description={project.description}
                        type="project"
                      />
                    </div>
                    
                    <p className="text-gray-600 mb-4">{project.description}</p>

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
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        Completed: {new Date(project.completion_date).toLocaleDateString()}
                      </div>

                      {user ? (
                        <>
                          {project.live_url && (
                            <div className="flex items-center">
                              <LinkIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <button
                                onClick={() => handleViewProject(project)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                Live Demo
                              </button>
                            </div>
                          )}

                          {project.github_url && (
                            <div className="flex items-center">
                              <Github className="w-4 h-4 mr-2 text-gray-500" />
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                GitHub Repository
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <AuthGuard action="view project details" redirectTo="/projects">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-400">
                              <LinkIcon className="w-4 h-4 mr-2" />
                              <span>Live Demo (Login Required)</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Github className="w-4 h-4 mr-2" />
                              <span>GitHub Repository (Login Required)</span>
                            </div>
                          </div>
                        </AuthGuard>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingProject ? 'Edit Project' : 'Upload Project'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., AI-Powered Task Manager"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe your project..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technologies Used* (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="technologies"
                        required
                        value={formData.technologies}
                        onChange={handleChange}
                        placeholder="React, TypeScript, Tailwind CSS, Node.js"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Date*
                      </label>
                      <input
                        type="date"
                        name="completionDate"
                        required
                        value={formData.completionDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/project-screenshot.jpg"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Live Demo URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="liveUrl"
                        value={formData.liveUrl}
                        onChange={handleChange}
                        placeholder="https://your-project.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Repository URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username/project"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 flex items-center"
                    >
                      {uploading ? (
                        <LoadingSpinner size="small" color="text-white" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {editingProject ? 'Update Project' : 'Upload Project'}
                        </>
                      )}
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

export default ProjectsPage;