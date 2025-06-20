import React from 'react';
import { Request } from '../../types/database';
import ChatWindow from '../chat/ChatWindow';

interface RequestDetailsProps {
  request: Request;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Request Details</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{request.title}</h3>
          <p className="text-gray-600 whitespace-pre-line">{request.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${request.status === 'new' && 'bg-blue-100 text-blue-800'}
            ${request.status === 'in_progress' && 'bg-yellow-100 text-yellow-800'}
            ${request.status === 'completed' && 'bg-green-100 text-green-800'}
            ${request.status === 'cancelled' && 'bg-red-100 text-red-800'}`}
          >
            {request.status.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-500">
            Submitted on {new Date(request.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Chat with Your Mentor</h2>
        <ChatWindow requestId={request.id} />
      </div>
    </div>
  );
};

export default RequestDetails;