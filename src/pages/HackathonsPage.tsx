import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Trophy, Users, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ShareButton from '../components/ui/ShareButton';
import AuthGuard from '../components/auth/AuthGuard';
import toast from 'react-hot-toast';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  online_link?: string;
  registration_link?: string;
  prize_pool?: string;
  max_participants?: number;
  image_url?: string;
}

const HackathonsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select('*')
          .order('start_date', { ascending: true });

        if (error) throw error;
        setHackathons(data || []);
      } catch (error) {
        console.error('Error fetching hackathons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const handleRegister = async (hackathon: Hackathon) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: '/hackathons' } });
      return;
    }

    setRegistering(hackathon.id);

    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (hackathon.registration_link) {
        window.open(hackathon.registration_link, '_blank');
      } else {
        toast.success('Registration successful! You will receive confirmation details via email.');
      }
    } catch (error) {
      console.error('Error registering for hackathon:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setRegistering(null);
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
          <h1 className="text-4xl font-bold mb-4">Upcoming Hackathons</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our exciting hackathons and showcase your AI innovation skills.
          </p>
        </div>

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hackathons Available</h3>
            <p className="text-gray-500">Check back later for upcoming hackathons!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon) => (
              <div key={hackathon.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  {hackathon.image_url ? (
                    <img
                      src={hackathon.image_url}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold flex-1">{hackathon.title}</h3>
                    <ShareButton
                      url={`/hackathons#${hackathon.id}`}
                      title={hackathon.title}
                      description={hackathon.description}
                      type="hackathon"
                    />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {hackathon.location}
                    </div>

                    {hackathon.max_participants && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Max {hackathon.max_participants} participants
                      </div>
                    )}

                    {hackathon.prize_pool && (
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Prize Pool: {hackathon.prize_pool}
                      </div>
                    )}
                  </div>

                  {user ? (
                    <button
                      onClick={() => handleRegister(hackathon)}
                      disabled={registering === hackathon.id}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                    >
                      {registering === hackathon.id ? (
                        <LoadingSpinner size="small" color="text-white" />
                      ) : (
                        <>
                          Register Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  ) : (
                    <AuthGuard action="register for hackathons" redirectTo="/hackathons">
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

export default HackathonsPage;