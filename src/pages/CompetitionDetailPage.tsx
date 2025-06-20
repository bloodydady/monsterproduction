import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Clock, DollarSign, Mail, Phone, ExternalLink } from 'lucide-react';
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
  rules?: string;
  location: string;
  contact_email: string;
  contact_phone?: string;
  image_url?: string;
  is_approved: boolean;
  is_featured: boolean;
  status: string;
  organizer?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  participant_count?: number;
  user_registered?: boolean;
}

const CompetitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        if (!id) {
          throw new Error('Competition ID is required');
        }

        const { data, error } = await supabase
          .from('competitions')
          .select(`
            *,
            organizer:organizer_id(first_name, last_name, email, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Competition not found');

        // Get participant count
        const { count: participantCount } = await supabase
          .from('competition_participants')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', id);

        // Check if user is registered
        let userRegistered = false;
        if (user) {
          const { data: registration } = await supabase
            .from('competition_participants')
            .select('id')
            .eq('competition_id', id)
            .eq('user_id', user.id)
            .single();
          userRegistered = !!registration;
        }

        setCompetition({
          ...data,
          participant_count: participantCount || 0,
          user_registered: userRegistered
        });
      } catch (err) {
        console.error('Error fetching competition:', err);
        setError(err instanceof Error ? err.message : 'Failed to load competition');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/competitions/${id}` } });
      return;
    }

    if (!competition) return;

    setRegistering(true);

    try {
      const { error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competition.id,
          user_id: user.id,
          payment_status: competition.entry_fee > 0 ? 'pending' : 'paid'
        });

      if (error) throw error;
      
      toast.success('Successfully registered for the competition!');
      
      // Update local state
      setCompetition(prev => prev ? {
        ...prev,
        user_registered: true,
        participant_count: (prev.participant_count || 0) + 1
      } : null);
    } catch (error: any) {
      console.error('Error registering for competition:', error);
      if (error.code === '23505') {
        toast.error('You are already registered for this competition');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

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

  const isRegistrationOpen = () => {
    if (!competition) return false;
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

  if (error || !competition) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || 'Competition not found'}</p>
        <button
          onClick={() => navigate('/competitions')}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Competitions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/competitions')}
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Competitions
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 md:h-80 bg-gray-200 relative">
            {competition.image_url ? (
              <img
                src={competition.image_url}
                alt={competition.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600">
                <Trophy className="w-24 h-24 text-white" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                {competition.status}
              </span>
              {competition.is_featured && (
                <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{competition.title}</h1>
              <ShareButton
                url={`/competitions/${competition.id}`}
                title={competition.title}
                description={competition.description}
                type="hackathon"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">
                    {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{competition.location}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">
                    {competition.participant_count}
                    {competition.max_participants && ` / ${competition.max_participants}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Registration Deadline</p>
                  <p className="font-medium">{new Date(competition.registration_deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Registration Button */}
            <div className="mb-8">
              {user ? (
                <div className="flex gap-4">
                  {isRegistrationOpen() && !competition.user_registered && (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center"
                    >
                      {registering ? (
                        <LoadingSpinner size="small" color="text-white" />
                      ) : (
                        <>
                          Register Now
                          {competition.entry_fee > 0 && (
                            <span className="ml-2">- ₹{competition.entry_fee}</span>
                          )}
                        </>
                      )}
                    </button>
                  )}
                  
                  {competition.user_registered && (
                    <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
                      ✓ You are registered
                    </div>
                  )}
                  
                  {!isRegistrationOpen() && competition.status === 'open' && (
                    <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-semibold">
                      Registration Closed
                    </div>
                  )}
                </div>
              ) : (
                <AuthGuard action="register for this competition" redirectTo={`/competitions/${competition.id}`}>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold">
                    Register Now
                    {competition.entry_fee > 0 && (
                      <span className="ml-2">- ₹{competition.entry_fee}</span>
                    )}
                  </button>
                </AuthGuard>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">About This Competition</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{competition.description}</p>
              </div>
            </div>

            {/* Rules */}
            {competition.rules && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Rules & Guidelines</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{competition.rules}</p>
                </div>
              </div>
            )}

            {/* Prize Pool */}
            {competition.prize_pool && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Prizes</h2>
                <div className="flex items-start">
                  <Trophy className="w-6 h-6 text-yellow-500 mr-3 mt-1" />
                  <p className="text-gray-700">{competition.prize_pool}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Competition Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Competition Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium capitalize">{competition.category.replace('_', '/')}</p>
                </div>

                {competition.entry_fee > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Entry Fee</p>
                    <p className="font-medium">₹{competition.entry_fee}</p>
                  </div>
                )}

                {competition.max_participants && (
                  <div>
                    <p className="text-sm text-gray-500">Max Participants</p>
                    <p className="font-medium">{competition.max_participants}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Current Participants</p>
                  <p className="font-medium">{competition.participant_count}</p>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Organized By</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-lg">{competition.organization_name}</p>
                  {competition.organizer && (
                    <p className="text-gray-600">
                      {competition.organizer.first_name} {competition.organizer.last_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <a
                      href={`mailto:${competition.contact_email}`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {competition.contact_email}
                    </a>
                  </div>

                  {competition.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <a
                        href={`tel:${competition.contact_phone}`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {competition.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Deadline</span>
                  <span className="font-medium">{new Date(competition.registration_deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{new Date(competition.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-medium">{new Date(competition.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailPage;