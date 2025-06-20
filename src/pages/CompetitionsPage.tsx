import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Trophy, Users, Plus, Filter, Search, Clock, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ShareButton from '../components/ui/ShareButton';
import AuthGuard from '../components/auth/AuthGuard';
import toast from 'react-hot-toast';

interface Competition {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organization_name: string;
  category: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants?: number;
  entry_fee: number;
  prize_pool?: string;
  location: string;
  image_url?: string;
  is_approved: boolean;
  is_featured: boolean;
  status: string;
  organizer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  participant_count?: number;
  user_registered?: boolean;
}

const CompetitionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userCompetitions, setUserCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitions();
    if (user) {
      fetchUserCompetitions();
    }
  }, [user]);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          organizer:organizer_id(first_name, last_name, email),
          participant_count:competition_participants(count)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to include participant count and user registration status
      const processedData = await Promise.all(
        (data || []).map(async (comp) => {
          const participantCount = comp.participant_count?.[0]?.count || 0;
          
          let userRegistered = false;
          if (user) {
            const { data: registration } = await supabase
              .from('competition_participants')
              .select('id')
              .eq('competition_id', comp.id)
              .eq('user_id', user.id)
              .single();
            userRegistered = !!registration;
          }
          
          return {
            ...comp,
            participant_count: participantCount,
            user_registered: userRegistered
          };
        })
      );
      
      setCompetitions(processedData);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCompetitions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserCompetitions(data || []);
    } catch (error) {
      console.error('Error fetching user competitions:', error);
    }
  };

  const handleRegister = async (competitionId: string) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/competitions' } });
      return;
    }

    setRegistering(competitionId);

    try {
      const { error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          payment_status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Successfully registered for the competition!');
      fetchCompetitions(); // Refresh to update registration status
    } catch (error: any) {
      console.error('Error registering for competition:', error);
      if (error.code === '23505') {
        toast.error('You are already registered for this competition');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } finally {
      setRegistering(null);
    }
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = 
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || competition.category === categoryFilter;
    const matchesStatus = statusFilter === '' || competition.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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

  const isRegistrationOpen = (competition: Competition) => {
    const now = new Date();
    const deadline = new Date(competition.registration_deadline);
    return competition.status === 'open' && now <= deadline;
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
          <h1 className="text-4xl font-bold mb-4">Competitions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting competitions organized by schools, institutes, and organizations. 
            Showcase your skills and win amazing prizes!
          </p>
        </div>

        {/* Organize Competition CTA */}
        {user && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Organize a Competition</h2>
                <p className="text-purple-100">
                  Are you from a school or institute? Host your own competition and reach talented participants!
                </p>
              </div>
              <button
                onClick={() => navigate('/competitions/create')}
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Competition
              </button>
            </div>
          </div>
        )}

        {/* User's Competitions */}
        {user && userCompetitions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">My Organized Competitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-500">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{competition.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                        {competition.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{competition.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {competition.is_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                      <button
                        onClick={() => navigate(`/competitions/manage/${competition.id}`)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="hackathon">Hackathon</option>
                <option value="coding">Coding</option>
                <option value="ai_ml">AI/ML</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
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
                <option value="">All Status</option>
                <option value="open">Open for Registration</option>
                <option value="ongoing">Ongoing</option>
                <option value="judging">Under Judging</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        {filteredCompetitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No competitions found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria, or be the first to organize a competition!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompetitions.map((competition) => (
              <div key={competition.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  {competition.image_url ? (
                    <img
                      src={competition.image_url}
                      alt={competition.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                      {competition.status}
                    </span>
                    {competition.is_featured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold flex-1">{competition.title}</h3>
                    <ShareButton
                      url={`/competitions/${competition.id}`}
                      title={competition.title}
                      description={competition.description}
                      type="hackathon"
                    />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{competition.description}</p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {competition.location}
                    </div>

                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {competition.participant_count} participants
                      {competition.max_participants && ` (max ${competition.max_participants})`}
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Registration until {new Date(competition.registration_deadline).toLocaleDateString()}
                    </div>

                    {competition.entry_fee > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Entry Fee: ₹{competition.entry_fee}
                      </div>
                    )}

                    {competition.prize_pool && (
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Prize: {competition.prize_pool}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Organized by <span className="font-medium">{competition.organization_name}</span>
                  </div>

                  {user ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/competitions/${competition.id}`)}
                        className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                      >
                        View Details
                      </button>
                      
                      {isRegistrationOpen(competition) && !competition.user_registered && (
                        <button
                          onClick={() => handleRegister(competition.id)}
                          disabled={registering === competition.id}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                        >
                          {registering === competition.id ? (
                            <LoadingSpinner size="small" color="text-white" />
                          ) : (
                            'Register'
                          )}
                        </button>
                      )}
                      
                      {competition.user_registered && (
                        <span className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-md text-center font-medium">
                          Registered
                        </span>
                      )}
                    </div>
                  ) : (
                    <AuthGuard action="register for competitions" redirectTo="/competitions">
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md">
                        Register Now
                      </button>
                    </AuthGuard>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsPage;