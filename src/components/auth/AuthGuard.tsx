import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  action: string;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, action, redirectTo }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <LogIn className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Login Required
        </h3>
        <p className="text-yellow-700">
          You need to be logged in to {action}.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/login', { state: { redirectTo } })}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </button>
        
        <button
          onClick={() => navigate('/register', { state: { redirectTo } })}
          className="inline-flex items-center px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthGuard;