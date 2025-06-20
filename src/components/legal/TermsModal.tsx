import React, { useState, useEffect } from 'react';
import { X, FileText, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept, onDecline }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (agreed && hasScrolledToBottom) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <p className="text-base font-medium text-gray-900">
              Welcome to <strong>https://monsterproduction.netlify.app/</strong> ("Site"), owned and operated by Monster Production Private Limited ("Company," "we," "us," or "our"). By accessing or using the Site, you ("you," "Participant," or "User") agree to be bound by these Terms and Conditions ("T&C"). If you do not agree to these T&C, please do not use the Site.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Eligibility & Registration</h3>
              <p className="mb-2"><strong>1.1.</strong> You must be at least 18 years old (or the age of majority in your jurisdiction) to participate in any hackathon or challenge hosted on the Site.</p>
              <p><strong>1.2.</strong> You agree to provide accurate, current, and complete information when registering.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Code of Conduct & Anti-Cheating</h3>
              <p className="mb-2"><strong>2.1.</strong> All Participants must abide by the official rule set and deadlines for each hackathon or challenge.</p>
              <p className="mb-2"><strong>2.2.</strong> Cheating—including plagiarism, unauthorized collaboration, use of proprietary code not owned or licensed by you, or any attempt to manipulate results—is strictly prohibited.</p>
              <p className="mb-2"><strong>2.3.</strong> Any Participant found cheating may, at the Company's sole discretion:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Be disqualified from the event;</li>
                <li>Forfeit any prizes or awards;</li>
                <li>Be barred from participating in future Company events.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Prize Allocation & Distribution</h3>
              <div className="mb-3">
                <p className="font-medium mb-2"><strong>3.1. Cash Prizes</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>If you win a cash prize in any hackathon or challenge, you agree that 60% of the awarded cash will be retained by the Company.</li>
                  <li>The remaining 40% will be paid to you, subject to applicable taxes and any local withholding requirements.</li>
                </ul>
              </div>
              <div className="mb-3">
                <p className="font-medium mb-2"><strong>3.2. Non-Cash Prizes</strong></p>
                <p className="ml-4">Non-monetary rewards—such as swag, certificates, goodies, and other merchandise—are provided to you at no cost, and you retain 100% ownership of these items.</p>
              </div>
              <div>
                <p className="font-medium mb-2"><strong>3.3. Payment Timing</strong></p>
                <p className="ml-4">Cash prize payouts will be processed within 60 days of the official winner announcement, after verification of eligibility and compliance with these T&C.</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Intellectual Property & Confidentiality</h3>
              <div className="mb-3">
                <p className="font-medium mb-2"><strong>4.1. Your Submissions</strong></p>
                <p className="ml-4">You retain all ownership rights to your original code, designs, and submissions, subject to the license granted below.</p>
              </div>
              <div className="mb-3">
                <p className="font-medium mb-2"><strong>4.2. License to Company</strong></p>
                <p className="ml-4">By submitting any project, you grant the Company a perpetual, worldwide, royalty-free, non-exclusive license to use, reproduce, display, distribute, and modify your submission for promotional, educational, and commercial purposes.</p>
              </div>
              <div>
                <p className="font-medium mb-2"><strong>4.3. Protection of Site IP</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>The design, layout, features, "look and feel," and all content on the Site are the sole property of Monster Production Private Limited.</li>
                  <li>You agree not to copy, reverse-engineer, duplicate, distribute, or otherwise exploit any portion of the Site or its underlying business model, codebase, or proprietary processes without our express written consent.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy & Data Use</h3>
              <p className="mb-2"><strong>5.1.</strong> Your personal data will be handled in accordance with our Privacy Policy.</p>
              <p><strong>5.2.</strong> By participating, you consent to the Company's collection and use of your personal information for event administration, marketing, and analytic purposes.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Disclaimers & Limitation of Liability</h3>
              <p className="mb-2"><strong>6.1.</strong> The Site and all events are provided "as is," without warranty of any kind, express or implied.</p>
              <p className="mb-2"><strong>6.2.</strong> To the fullest extent permitted by law, the Company disclaims all liability for any damages arising out of your use of the Site or participation in any event.</p>
              <p><strong>6.3.</strong> In no event shall the Company's total liability exceed the amount of any cash prize actually paid to you.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Modification & Termination</h3>
              <p className="mb-2"><strong>7.1.</strong> We reserve the right to modify, suspend, or terminate any hackathon, challenge, or portion of the Site at any time, for any reason.</p>
              <p><strong>7.2.</strong> We may amend these T&C at any time by posting updated terms on this page. Your continued use of the Site after the effective date constitutes your acceptance of the revised T&C.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Governing Law & Dispute Resolution</h3>
              <p className="mb-2"><strong>8.1.</strong> These T&C shall be governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles.</p>
              <p><strong>8.2.</strong> Any dispute arising out of or relating to these T&C shall be resolved exclusively by the courts of Lucknow, Uttar Pradesh, India.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contact Us</h3>
              <p className="mb-2">If you have questions about these T&C, please contact us at:</p>
              <ul className="list-none ml-4 space-y-1">
                <li><strong>Email:</strong> monsterproduction21@gmail.com</li>
                <li><strong>Address:</strong> Monster Production Private Limited, Lucknow, Uttar Pradesh, India</li>
              </ul>
            </div>

            {!hasScrolledToBottom && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p className="text-yellow-700 text-sm">
                  Please scroll to the bottom to read all terms and conditions before agreeing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label 
              htmlFor="agree-terms" 
              className={`ml-3 text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}
            >
              I have read and agree to the Terms and Conditions
            </label>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDecline}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!agreed || !hasScrolledToBottom}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;