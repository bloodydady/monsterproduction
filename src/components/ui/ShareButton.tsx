import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  type: 'hackathon' | 'project' | 'tool';
}

const ShareButton: React.FC<ShareButtonProps> = ({ url, title, description, type }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${url}`;
  const shareText = description || title;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Facebook className="w-4 h-4 mr-3 text-blue-600" />
              Share on Facebook
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Twitter className="w-4 h-4 mr-3 text-blue-400" />
              Share on Twitter
            </button>
            
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
              Share on LinkedIn
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={handleCopyLink}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-3 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 mr-3" />
              )}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;