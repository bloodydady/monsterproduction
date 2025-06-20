import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../App';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, Users, Trophy } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

const AdminHackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    onlineLink: '',
    registrationLink: '',
    prizePool: '',
    maxParticipants: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchHackathons();
  }, []);

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
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hackathonData = {
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        location: formData.location,
        online_link: formData.onlineLink || null,
        registration_link: formData.registrationLink || null,
        prize_pool: formData.prizePool || null,
        max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        image_url: formData.imageUrl || null,
      };

      if (editingHackathon) {
        const { error } = await supabase
          .from('hackathons')
          .update(hackathonData)
          .eq('id', editingHackathon.id);

        if (error) throw error;
        toast.success('Hackathon updated successfully');
      } else {
        const { error } = await supabase
          .from('hackathons')
          .insert(hackathonData);

        if (error) throw error;
        toast.success('Hackathon created successfully');
      }

      setShowModal(false);
      setEditingHackathon(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        onlineLink: '',
        registrationLink: '',
        prizePool: '',
        maxParticipants: '',
        imageUrl: '',
      });
      fetchHackathons();
    } catch (error) {
      console.error('Error saving hackathon:', error);
      toast.error('Failed to save hackathon');
    }
  };

  const handleEdit = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon);
    setFormData({
      title: hackathon.title,
      description: hackathon.description,
      startDate: new Date(hackathon.start_date).toISOString().slice(0, 16),
      endDate: new Date(hackathon.end_date).toISOString().slice(0, 16),
      location: hackathon.location,
      onlineLink: hackathon.online_link || '',
      registrationLink: hackathon.registration_link || '',
      prizePool: hackathon.prize_pool || '',
      maxParticipants: hackathon.max_participants?.toString() || '',
      imageUrl: hackathon.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;

    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHackathons(hackathons.filter(h => h.id !== id));
      toast.success('Hackathon deleted successfully');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      toast.error('Failed to delete hackathon');
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Manage Hackathons</h1>
            <button
              onClick={() => {
                setEditingHackathon(null);
                setFormData({
                  title: '',
                  description: '',
                  startDate: '',
                  endDate: '',
                  location: '',
                  onlineLink: '',
                  registrationLink: '',
                  prizePool: '',
                  maxParticipants: '',
                  imageUrl: '',
                });
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Hackathon
            </button>
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
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

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(hackathon)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(hackathon.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingHackathon ? 'Edit Hackathon' : 'Add New Hackathon'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date*
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date*
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Online Link
                      </label>
                      <input
                        type="url"
                        value={formData.onlineLink}
                        onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Link
                      </label>
                      <input
                        type="url"
                        value={formData.registrationLink}
                        onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prize Pool
                      </label>
                      <input
                        type="text"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
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
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      {editingHackathon ? 'Update Hackathon' : 'Add Hackathon'}
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

export default AdminHackathons;