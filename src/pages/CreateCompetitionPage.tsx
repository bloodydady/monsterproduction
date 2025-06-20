import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateCompetitionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizationName: '',
    category: 'hackathon',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    entryFee: '0',
    prizePool: '',
    rules: '',
    imageUrl: '',
    location: '',
    contactEmail: user?.email || '',
    contactPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a competition');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('competitions')
        .insert({
          title: formData.title,
          description: formData.description,
          organizer_id: user.id,
          organization_name: formData.organizationName,
          category: formData.category,
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
          registration_deadline: new Date(formData.registrationDeadline).toISOString(),
          max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          entry_fee: parseFloat(formData.entryFee),
          prize_pool: formData.prizePool || null,
          rules: formData.rules || null,
          image_url: formData.imageUrl || null,
          location: formData.location,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          status: 'open',
          is_approved: false, // Requires admin approval
        });

      if (error) throw error;

      toast.success('Competition created successfully! It will be reviewed for approval.');
      navigate('/competitions');
    } catch (error) {
      console.error('Error creating competition:', error);
      toast.error('Failed to create competition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be logged in to create a competition.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/competitions')}
              className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Competitions
            </button>
            <h1 className="text-3xl font-bold">Create Competition</h1>
            <p className="text-gray-600">Organize a competition for your school, institute, or organization</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Basic Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Competition Title*
                        </label>
                        <input
                          type="text"
                          name="title"
                          required
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="e.g., AI Innovation Challenge 2024"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name*
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          required
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder="e.g., ABC University"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe your competition, its objectives, and what participants can expect..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category*
                        </label>
                        <select
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="hackathon">Hackathon</option>
                          <option value="coding">Coding</option>
                          <option value="ai_ml">AI/ML</option>
                          <option value="design">Design</option>
                          <option value="business">Business</option>
                          <option value="research">Research</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location*
                        </label>
                        <input
                          type="text"
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., Online, Mumbai, or Hybrid"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates and Registration */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-bold mb-4">Dates & Registration</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date*
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date*
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          required
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Registration Deadline*
                        </label>
                        <input
                          type="datetime-local"
                          name="registrationDeadline"
                          required
                          value={formData.registrationDeadline}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Participants (Optional)
                        </label>
                        <input
                          type="number"
                          name="maxParticipants"
                          min="1"
                          value={formData.maxParticipants}
                          onChange={handleChange}
                          placeholder="Leave empty for unlimited"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Entry Fee (₹)
                        </label>
                        <input
                          type="number"
                          name="entryFee"
                          min="0"
                          step="0.01"
                          value={formData.entryFee}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-bold mb-4">Additional Details</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prize Pool (Optional)
                        </label>
                        <input
                          type="text"
                          name="prizePool"
                          value={formData.prizePool}
                          onChange={handleChange}
                          placeholder="e.g., ₹50,000 cash prizes + certificates"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Competition Rules (Optional)
                        </label>
                        <textarea
                          name="rules"
                          value={formData.rules}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Specify competition rules, judging criteria, submission guidelines, etc."
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Competition Banner URL (Optional)
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Email*
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          required
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/competitions')}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="small" color="text-white" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Competition
                      </>
                    )}
                  </button>
                </div>

                {/* Note */}
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> Your competition will be reviewed by our team before being published. 
                    This usually takes 24-48 hours. You'll receive an email notification once it's approved.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCompetitionPage;