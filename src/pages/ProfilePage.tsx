import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../App';
import { User, Upload, Save, AlertCircle } from 'lucide-react';
import { Request } from '../types/database';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Fetch user's profile and requests
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user's requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setUserRequests(requestsData || []);

        // Set form data from profile
        if (profile) {
          setFormData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    try {
      // Upload avatar to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">You must be logged in to view this page.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar section */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center cursor-pointer text-purple-600 hover:text-purple-800"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </div>

                {/* Profile form */}
                <div className="flex-grow">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
                        Bio (Optional)
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400"
                      >
                        {updating ? (
                          <LoadingSpinner size="small" color="text-white" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Requests section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Requests</h2>
            
            {userRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">You haven't submitted any requests yet.</p>
                <button
                  onClick={() => navigate('/request-help')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Submit a Request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 capitalize">{request.request_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'new' && 'bg-blue-100 text-blue-800'}
                              ${request.status === 'in_progress' && 'bg-yellow-100 text-yellow-800'}
                              ${request.status === 'completed' && 'bg-green-100 text-green-800'}
                              ${request.status === 'cancelled' && 'bg-red-100 text-red-800'}`}
                            >
                              {request.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900">View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Account actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Account</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {/* Change password logic */}}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Change Password
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;