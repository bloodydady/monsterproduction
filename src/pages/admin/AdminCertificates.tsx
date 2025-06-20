import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../App';
import { Certificate } from '../../types/database';
import { ArrowLeft, Search, Filter, Eye, Check, X, Star, Award } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          user:user_id(first_name, last_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (certificateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ is_verified: !currentStatus })
        .eq('id', certificateId);

      if (error) throw error;
      
      setCertificates(certificates.map(cert => 
        cert.id === certificateId ? { ...cert, is_verified: !currentStatus } : cert
      ));
      
      toast.success(`Certificate ${!currentStatus ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleFeaturedToggle = async (certificateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ is_featured: !currentStatus })
        .eq('id', certificateId);

      if (error) throw error;
      
      setCertificates(certificates.map(cert => 
        cert.id === certificateId ? { ...cert, is_featured: !currentStatus } : cert
      ));
      
      toast.success(`Certificate ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;
      
      setCertificates(certificates.filter(cert => cert.id !== certificateId));
      toast.success('Certificate deleted successfully');
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = 
      certificate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (certificate.user && `${certificate.user.first_name} ${certificate.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && certificate.is_verified) ||
      (statusFilter === 'unverified' && !certificate.is_verified) ||
      (statusFilter === 'featured' && certificate.is_featured);
    
    const matchesCategory = categoryFilter === 'all' || certificate.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
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
          <h1 className="text-3xl font-bold">Manage Certificates</h1>
          <p className="text-gray-600">Review and manage user certificates and success stories</p>
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
                placeholder="Search certificates..."
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
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
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
                <option value="workshop">Workshop</option>
                <option value="course">Course</option>
                <option value="achievement">Achievement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
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
                
                {certificate.user && (
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mr-3">
                      {certificate.user.avatar_url ? (
                        <img
                          src={certificate.user.avatar_url}
                          alt={`${certificate.user.first_name} ${certificate.user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {certificate.user.first_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {certificate.user.first_name} {certificate.user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{certificate.user.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    {certificate.issued_by}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-center">📅</span>
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </div>
                  {certificate.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {certificate.rating}/5 Rating
                    </div>
                  )}
                </div>

                {certificate.feedback && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 italic">"{certificate.feedback}"</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(certificate.certificate_url, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Certificate"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleVerificationToggle(certificate.id, certificate.is_verified)}
                      className={`${
                        certificate.is_verified ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={certificate.is_verified ? 'Unverify' : 'Verify'}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleFeaturedToggle(certificate.id, certificate.is_featured)}
                      className={`${
                        certificate.is_featured ? 'text-purple-600 hover:text-purple-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={certificate.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(certificate.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Certificate"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {certificate.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No certificates found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;