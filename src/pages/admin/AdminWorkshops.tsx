import React, { useState, useEffect } from 'react';
import { supabase } from '../../App';
import { Workshop } from '../../types/database';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Search, Filter, Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminWorkshops: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    onlineLink: '',
    maxParticipants: '',
    status: 'scheduled' as Workshop['status'],
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          *,
          organizer:organizer_id(first_name, last_name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error('Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const workshopData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location || null,
        online_link: formData.onlineLink || null,
        max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        status: formData.status,
        organizer_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
      };

      if (editingWorkshop) {
        // Update existing workshop
        const { error } = await supabase
          .from('workshops')
          .update(workshopData)
          .eq('id', editingWorkshop.id);

        if (error) throw error;
        toast.success('Workshop updated successfully');
      } else {
        // Create new workshop
        const { error } = await supabase
          .from('workshops')
          .insert(workshopData);

        if (error) throw error;
        toast.success('Workshop created successfully');
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        onlineLink: '',
        maxParticipants: '',
        status: 'scheduled',
      });
      setEditingWorkshop(null);
      setShowAddModal(false);
      fetchWorkshops();
    } catch (error) {
      console.error('Error saving workshop:', error);
      toast.error('Failed to save workshop');
    }
  };

  const handleDelete = async (workshopId: string) => {
    if (!confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;
      
      setWorkshops(workshops.filter(workshop => workshop.id !== workshopId));
      toast.success('Workshop deleted successfully');
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast.error('Failed to delete workshop');
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      date: new Date(workshop.date).toISOString().slice(0, 16),
      location: workshop.location || '',
      onlineLink: workshop.online_link || '',
      maxParticipants: workshop.max_participants?.toString() || '',
      status: workshop.status,
    });
    setShowAddModal(true);
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workshop.status === statusFilter;
    
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
          <h1 className="text-3xl font-bold">Manage Workshops</h1>
          <p className="text-gray-600">Schedule and manage workshops and events</p>
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
                placeholder="Search workshops..."
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
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingWorkshop(null);
                  setFormData({
                    title: '',
                    description: '',
                    date: '',
                    location: '',
                    onlineLink: '',
                    maxParticipants: '',
                    status: 'scheduled',
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Workshop
              </button>
            </div>
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <div key={workshop.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${workshop.status === 'scheduled' && 'bg-blue-100 text-blue-800'}
                    ${workshop.status === 'completed' && 'bg-green-100 text-green-800'}
                    ${workshop.status === 'cancelled' && 'bg-red-100 text-red-800'}`}
                  >
                    {workshop.status}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(workshop)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(workshop.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{workshop.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(workshop.date).toLocaleDateString()} at{' '}
                    {new Date(workshop.date).toLocaleTimeString()}
                  </div>
                  
                  {workshop.location && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {workshop.location}
                    </div>
                  )}
                  
                  {workshop.max_participants && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Max {workshop.max_participants} participants
                    </div>
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
                  {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date and Time*
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Physical location (if applicable)"
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
                        placeholder="Video conference link"
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
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Workshop['status'] })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
                      {editingWorkshop ? 'Update Workshop' : 'Add Workshop'}
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

export default AdminWorkshops;