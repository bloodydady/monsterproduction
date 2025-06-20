import React, { useState, useEffect } from 'react';
import { supabase } from '../../App';
import { Request } from '../../types/database';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Filter, Search, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import RequestDetails from '../../components/request/RequestDetails';

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          assigned_to_user:assigned_to(first_name, last_name),
          tool:tool_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: newStatus,
          assigned_to: newStatus === 'in_progress' ? supabase.auth.getUser().then(({ data }) => data.user?.id) : null
        })
        .eq('id', requestId);

      if (error) throw error;
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status: newStatus } : request
      ));

      toast.success(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowChatModal(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user && `${request.user.first_name} ${request.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.request_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
          <h1 className="text-3xl font-bold">Manage Requests</h1>
          <p className="text-gray-600">Handle user requests and mentorship inquiries</p>
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
                placeholder="Search requests..."
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
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="mentorship">Mentorship</option>
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{request.description}</div>
                      {request.tool && (
                        <div className="text-xs text-purple-600 mt-1">
                          Tool: {request.tool.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {request.user && (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user.first_name} {request.user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {request.request_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${request.status === 'new' && 'bg-blue-100 text-blue-800'}
                        ${request.status === 'in_progress' && 'bg-yellow-100 text-yellow-800'}
                        ${request.status === 'completed' && 'bg-green-100 text-green-800'}
                        ${request.status === 'cancelled' && 'bg-red-100 text-red-800'}`}
                      >
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Details & Chat"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        {request.status === 'new' && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'in_progress')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Accept Request"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        )}
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {(request.status === 'new' || request.status === 'in_progress') && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Request"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat Modal */}
        {showChatModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Request Details & Chat</h2>
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <RequestDetails request={selectedRequest} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;