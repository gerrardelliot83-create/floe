'use client';

import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@floe/ui/auth/OnboardingFlow';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/app');
  };

  return (
    <OnboardingFlow onComplete={handleComplete} />
  );
}