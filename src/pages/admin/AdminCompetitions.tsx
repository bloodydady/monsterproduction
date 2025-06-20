import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../App';
import { ArrowLeft, Search, Filter, Eye, Check, X, Star, Trophy } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Competition {
  id: string;
  title: string;
  description: string;
  organization_name: string;
  category: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  entry_fee: number;
  prize_pool?: string;
  location: string;
  contact_email: string;
  is_approved: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  organizer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  participant_count?: number;
}

const AdminCompetitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          organizer:organizer_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get participant counts
      const competitionsWithCounts = await Promise.all(
        (data || []).map(async (comp) => {
          const { count } = await supabase
            .from('competition_participants')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', comp.id);
          
          return {
            ...comp,
            participant_count: count || 0
          };
        })
      );
      
      setCompetitions(competitionsWithCounts);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (competitionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('competitions')
        .update({ is_approved: !currentStatus })
        .eq('id', competitionId);

      if (error) throw error;
      
      setCompetitions(competitions.map(comp => 
        comp.id === competitionId ? { ...comp, is_approved: !currentStatus } : comp
      ));
      
      toast.success(`Competition ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast.error('Failed to update approval status');
    }
  };

  const handleFeaturedToggle = async (competitionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('competitions')
        .update({ is_featured: !currentStatus })
        .eq('id', competitionId);

      if (error) throw error;
      
      setCompetitions(competitions.map(comp => 
        comp.id === competitionId ? { ...comp, is_featured: !currentStatus } : comp
      ));
      
      toast.success(`Competition ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (competitionId: string) => {
    if (!confirm('Are you sure you want to delete this competition? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competitionId);

      if (error) throw error;
      
      setCompetitions(competitions.filter(comp => comp.id !== competitionId));
      toast.success('Competition deleted successfully');
    } catch (error) {
      console.error('Error deleting competition:', error);
      toast.error('Failed to delete competition');
    }
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = 
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (competition.organizer && `${competition.organizer.first_name} ${competition.organizer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && competition.is_approved) ||
      (statusFilter === 'pending' && !competition.is_approved) ||
      (statusFilter === 'featured' && competition.is_featured);
    
    const matchesCategory = categoryFilter === 'all' || competition.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'judging': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="mb-8">
          <Link 
            to="/admin"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Competitions</h1>
          <p className="text-gray-600">Review and moderate competition submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search competitions..."
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
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="featured">Featured</option>
              </select>
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
                <option value="hackathon">Hackathon</option>
                <option value="coding">Coding</option>
                <option value="ai_ml">AI/ML</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((competition) => (
            <div key={competition.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold line-clamp-2">{competition.title}</h3>
                  <div className="flex gap-2">
                    {competition.is_approved ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                    {competition.is_featured && (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{competition.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Organization:</span>
                    <span className="font-medium">{competition.organization_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium capitalize">{competition.category.replace('_', '/')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-medium">{competition.participant_count}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Entry Fee:</span>
                    <span className="font-medium">₹{competition.entry_fee}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                      {competition.status}
                    </span>
                  </div>
                </div>

                {competition.organizer && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium">Organizer</p>
                    <p className="text-sm text-gray-600">
                      {competition.organizer.first_name} {competition.organizer.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{competition.organizer.email}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/competitions/${competition.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Competition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleApprovalToggle(competition.id, competition.is_approved)}
                      className={`${
                        competition.is_approved ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={competition.is_approved ? 'Unapprove' : 'Approve'}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleFeaturedToggle(competition.id, competition.is_featured)}
                      className={`${
                        competition.is_featured ? 'text-purple-600 hover:text-purple-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={competition.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(competition.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Competition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(competition.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompetitions.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No competitions found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompetitions;