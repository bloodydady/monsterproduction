import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Calendar, PenTool as Tool, TrendingUp, BarChart, ArrowUpRight, Award, Trophy } from 'lucide-react';
import { supabase } from '../../App';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  totalWorkshops: number;
  totalTools: number;
  activeRequests: number;
  completedRequests: number;
  totalHackathons: number;
  totalProjects: number;
  totalCertificates: number;
  verifiedCertificates: number;
  totalCompetitions: number;
  pendingCompetitions: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRequests: 0,
    totalWorkshops: 0,
    totalTools: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalHackathons: 0,
    totalProjects: 0,
    totalCertificates: 0,
    verifiedCertificates: 0,
    totalCompetitions: 0,
    pendingCompetitions: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total requests
        const { count: requestsCount } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true });

        // Fetch active requests
        const { count: activeCount } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');

        // Fetch completed requests
        const { count: completedCount } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        // Fetch total workshops
        const { count: workshopsCount } = await supabase
          .from('workshops')
          .select('*', { count: 'exact', head: true });

        // Fetch total tools
        const { count: toolsCount } = await supabase
          .from('ai_tools')
          .select('*', { count: 'exact', head: true });

        // Fetch total hackathons
        const { count: hackathonsCount } = await supabase
          .from('hackathons')
          .select('*', { count: 'exact', head: true });

        // Fetch total projects
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        // Fetch total certificates
        const { count: certificatesCount } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true });

        // Fetch verified certificates
        const { count: verifiedCount } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true);

        // Fetch total competitions
        const { count: competitionsCount } = await supabase
          .from('competitions')
          .select('*', { count: 'exact', head: true });

        // Fetch pending competitions
        const { count: pendingCount } = await supabase
          .from('competitions')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', false);

        // Fetch recent activity
        const { data: recentData } = await supabase
          .from('requests')
          .select(`
            *,
            user:user_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(recentData || []);
        setStats({
          totalUsers: usersCount || 0,
          totalRequests: requestsCount || 0,
          totalWorkshops: workshopsCount || 0,
          totalTools: toolsCount || 0,
          activeRequests: activeCount || 0,
          completedRequests: completedCount || 0,
          totalHackathons: hackathonsCount || 0,
          totalProjects: projectsCount || 0,
          totalCertificates: certificatesCount || 0,
          verifiedCertificates: verifiedCount || 0,
          totalCompetitions: competitionsCount || 0,
          pendingCompetitions: pendingCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalUsers}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-gray-500 mt-1">Active platform users</p>
            <Link to="/admin/users" className="inline-flex items-center text-purple-600 mt-3 text-sm hover:text-purple-700">
              View all users <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalRequests}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Requests</h3>
            <p className="text-gray-500 mt-1">Help and mentorship requests</p>
            <Link to="/admin/requests" className="inline-flex items-center text-blue-600 mt-3 text-sm hover:text-blue-700">
              View all requests <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalWorkshops}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Workshops</h3>
            <p className="text-gray-500 mt-1">Organized workshops and events</p>
            <Link to="/admin/workshops" className="inline-flex items-center text-green-600 mt-3 text-sm hover:text-green-700">
              View all workshops <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-orange-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Tool className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalTools}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">AI Tools</h3>
            <p className="text-gray-500 mt-1">Available AI tools and resources</p>
            <Link to="/admin/tools" className="inline-flex items-center text-orange-600 mt-3 text-sm hover:text-orange-700">
              Manage tools <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-yellow-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalHackathons}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Hackathons</h3>
            <p className="text-gray-500 mt-1">Organized hackathons</p>
            <Link to="/admin/hackathons" className="inline-flex items-center text-yellow-600 mt-3 text-sm hover:text-yellow-700">
              Manage hackathons <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <BarChart className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalProjects}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Projects</h3>
            <p className="text-gray-500 mt-1">Showcase projects</p>
            <Link to="/admin/projects" className="inline-flex items-center text-teal-600 mt-3 text-sm hover:text-teal-700">
              Manage projects <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalCertificates}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Certificates</h3>
            <p className="text-gray-500 mt-1">{stats.verifiedCertificates} verified</p>
            <Link to="/admin/certificates" className="inline-flex items-center text-pink-600 mt-3 text-sm hover:text-pink-700">
              Manage certificates <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalCompetitions}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Competitions</h3>
            <p className="text-gray-500 mt-1">{stats.pendingCompetitions} pending approval</p>
            <Link to="/admin/competitions" className="inline-flex items-center text-indigo-600 mt-3 text-sm hover:text-indigo-700">
              Manage competitions <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/requests"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <h3 className="font-semibold text-purple-700 group-hover:text-purple-800">Manage Requests</h3>
              <p className="text-sm text-purple-600 group-hover:text-purple-700">View and handle user requests</p>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <h3 className="font-semibold text-blue-700 group-hover:text-blue-800">User Management</h3>
              <p className="text-sm text-blue-600 group-hover:text-blue-700">Manage user accounts and roles</p>
            </Link>

            <Link
              to="/admin/tools"
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <h3 className="font-semibold text-green-700 group-hover:text-green-800">AI Tools</h3>
              <p className="text-sm text-green-600 group-hover:text-green-700">Update tool directory</p>
            </Link>

            <Link
              to="/admin/competitions"
              className="p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group"
            >
              <h3 className="font-semibold text-indigo-700 group-hover:text-indigo-800">Competitions</h3>
              <p className="text-sm text-indigo-600 group-hover:text-indigo-700">Review and approve competitions</p>
            </Link>

            <Link
              to="/admin/certificates"
              className="p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group"
            >
              <h3 className="font-semibold text-pink-700 group-hover:text-pink-800">Certificates</h3>
              <p className="text-sm text-pink-600 group-hover:text-pink-700">Review and verify certificates</p>
            </Link>

            <Link
              to="/admin/workshops"
              className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
            >
              <h3 className="font-semibold text-orange-700 group-hover:text-orange-800">Workshops</h3>
              <p className="text-sm text-orange-600 group-hover:text-orange-700">Manage workshops and events</p>
            </Link>

            <Link
              to="/admin/hackathons"
              className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors group"
            >
              <h3 className="font-semibold text-yellow-700 group-hover:text-yellow-800">Hackathons</h3>
              <p className="text-sm text-yellow-600 group-hover:text-yellow-700">Manage hackathon events</p>
            </Link>

            <Link
              to="/admin/projects"
              className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
            >
              <h3 className="font-semibold text-teal-700 group-hover:text-teal-800">Projects</h3>
              <p className="text-sm text-teal-600 group-hover:text-teal-700">Manage showcase projects</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                        {activity.request_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">
                        by {activity.user?.first_name} {activity.user?.last_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm
                        ${activity.status === 'new' && 'bg-blue-100 text-blue-700'}
                        ${activity.status === 'in_progress' && 'bg-yellow-100 text-yellow-700'}
                        ${activity.status === 'completed' && 'bg-green-100 text-green-700'}
                        ${activity.status === 'cancelled' && 'bg-red-100 text-red-700'}`}
                      >
                        {activity.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;