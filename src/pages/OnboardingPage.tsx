import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// Onboarding has been removed — username and language are handled at signup
// and in Settings respectively. This route now redirects to the dashboard.
export default function OnboardingPage() {
  useEffect(() => {}, []);
  return <Navigate to="/dashboard" replace />;
}
