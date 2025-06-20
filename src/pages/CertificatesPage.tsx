import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { Certificate } from '../types/database';
import { Upload, Award, Calendar, User, Star, Plus, Eye, Trash2, Edit2 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AuthGuard from '../components/auth/AuthGuard';
import toast from 'react-hot-toast';

const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userCertificates, setUserCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issuedBy: '',
    issueDate: '',
    category: 'achievement' as Certificate['category'],
    feedback: '',
    rating: 5,
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
    if (user) {
      fetchUserCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          user:user_id(first_name, last_name, avatar_url)
        `)
        .eq('is_featured', true)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserCertificates(data || []);
    } catch (error) {
      console.error('Error fetching user certificates:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setCertificateFile(file);
    }
  };

  const uploadCertificate = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !certificateFile) return;

    setUploading(true);

    try {
      // Upload certificate file
      const certificateUrl = await uploadCertificate(certificateFile);

      // Save certificate data
      const certificateData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        certificate_url: certificateUrl,
        issued_by: formData.issuedBy,
        issue_date: formData.issueDate,
        category: formData.category,
        feedback: formData.feedback || null,
        rating: formData.rating,
        is_verified: false,
        is_featured: false,
      };

      if (editingCertificate) {
        const { error } = await supabase
          .from('certificates')
          .update(certificateData)
          .eq('id', editingCertificate.id);

        if (error) throw error;
        toast.success('Certificate updated successfully!');
      } else {
        const { error } = await supabase
          .from('certificates')
          .insert(certificateData);

        if (error) throw error;
        toast.success('Certificate uploaded successfully! It will be reviewed for verification.');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        issuedBy: '',
        issueDate: '',
        category: 'achievement',
        feedback: '',
        rating: 5,
      });
      setCertificateFile(null);
      setShowUploadModal(false);
      setEditingCertificate(null);
      
      // Refresh data
      fetchUserCertificates();
      fetchCertificates();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      title: certificate.title,
      description: certificate.description,
      issuedBy: certificate.issued_by,
      issueDate: certificate.issue_date,
      category: certificate.category,
      feedback: certificate.feedback || '',
      rating: certificate.rating || 5,
    });
    setShowUploadModal(true);
  };

  const handleDelete = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;
      
      toast.success('Certificate deleted successfully');
      fetchUserCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <h1 className="text-4xl font-bold mb-4">Certificates & Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your achievements and see how Monster Production has helped others succeed in their AI journey.
          </p>
        </div>

        {/* Upload Section for Authenticated Users */}
        {user ? (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Certificates</h2>
              <button
                onClick={() => {
                  setEditingCertificate(null);
                  setFormData({
                    title: '',
                    description: '',
                    issuedBy: '',
                    issueDate: '',
                    category: 'achievement',
                    feedback: '',
                    rating: 5,
                  });
                  setCertificateFile(null);
                  setShowUploadModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Certificate
              </button>
            </div>

            {/* User's Certificates */}
            {userCertificates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Certificates Yet</h3>
                <p className="text-gray-500 mb-4">Upload your first certificate to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {userCertificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
                      <img
                        src={certificate.certificate_url}
                        alt={certificate.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {certificate.is_verified && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                        {certificate.is_featured && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{certificate.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{certificate.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          {certificate.issued_by}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(certificate.issue_date).toLocaleDateString()}
                        </div>
                        {certificate.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-yellow-500" />
                            {certificate.rating}/5 Rating
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(certificate.certificate_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Certificate"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(certificate)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit Certificate"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(certificate.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Certificate"
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
            <AuthGuard action="upload certificates" redirectTo="/certificates">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Upload className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Share Your Success</h3>
                <p className="text-gray-500">Login to upload your certificates and share your feedback!</p>
              </div>
            </AuthGuard>
          </div>
        )}

        {/* Featured Certificates */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
          
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Featured Certificates Yet</h3>
              <p className="text-gray-500">Be the first to share your success story!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={certificate.certificate_url}
                      alt={certificate.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{certificate.title}</h3>
                    <p className="text-gray-600 mb-4">{certificate.description}</p>
                    
                    {certificate.feedback && (
                      <div className="bg-purple-50 p-4 rounded-lg mb-4">
                        <p className="text-purple-800 italic">"{certificate.feedback}"</p>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {certificate.user ? `${certificate.user.first_name} ${certificate.user.last_name}` : 'Anonymous'}
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        {certificate.issued_by}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </div>
                      {certificate.rating && (
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < certificate.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2">{certificate.rating}/5</span>
                        </div>
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
                  {editingCertificate ? 'Edit Certificate' : 'Upload Certificate'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., AI Hackathon Winner"
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
                        placeholder="Describe your achievement..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issued By*
                        </label>
                        <input
                          type="text"
                          name="issuedBy"
                          required
                          value={formData.issuedBy}
                          onChange={handleChange}
                          placeholder="e.g., Monster Production"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Date*
                        </label>
                        <input
                          type="date"
                          name="issueDate"
                          required
                          value={formData.issueDate}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

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
                        <option value="workshop">Workshop</option>
                        <option value="course">Course</option>
                        <option value="achievement">Achievement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate File* (JPG, PNG, or PDF - Max 5MB)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required={!editingCertificate}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback about Monster Production (Optional)
                      </label>
                      <textarea
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Share your experience with Monster Production..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (1-5 stars)
                      </label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Fair</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
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
                      disabled={uploading || (!certificateFile && !editingCertificate)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 flex items-center"
                    >
                      {uploading ? (
                        <LoadingSpinner size="small" color="text-white" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {editingCertificate ? 'Update Certificate' : 'Upload Certificate'}
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

export default CertificatesPage;