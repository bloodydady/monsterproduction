import { useState, useEffect } from 'react';

const TERMS_ACCEPTANCE_KEY = 'monster-production-terms-accepted';
const TERMS_VERSION = '1.0'; // Update this when terms change

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const checkTermsAcceptance = () => {
      try {
        const stored = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
        if (stored) {
          const { accepted, version } = JSON.parse(stored);
          if (accepted && version === TERMS_VERSION) {
            setHasAcceptedTerms(true);
            return;
          }
        }
        
        // If no valid acceptance found, show modal
        setHasAcceptedTerms(false);
        setShowTermsModal(true);
      } catch (error) {
        console.error('Error checking terms acceptance:', error);
        setHasAcceptedTerms(false);
        setShowTermsModal(true);
      }
    };

    checkTermsAcceptance();
  }, []);

  const acceptTerms = () => {
    try {
      localStorage.setItem(TERMS_ACCEPTANCE_KEY, JSON.stringify({
        accepted: true,
        version: TERMS_VERSION,
        timestamp: new Date().toISOString()
      }));
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
  };

  const declineTerms = () => {
    setShowTermsModal(false);
    // Redirect to external site or show decline message
    window.location.href = 'https://www.google.com';
  };

  const resetTermsAcceptance = () => {
    localStorage.removeItem(TERMS_ACCEPTANCE_KEY);
    setHasAcceptedTerms(false);
    setShowTermsModal(true);
  };

  return {
    hasAcceptedTerms,
    showTermsModal,
    acceptTerms,
    declineTerms,
    resetTermsAcceptance
  };
};