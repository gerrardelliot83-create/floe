import { Stack } from 'expo-router';
import { ProtectedRoute } from '@floe/ui';

export default function AppLayout() {
  return (
    <ProtectedRoute requireOnboarding={true}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      />
    </ProtectedRoute>
  );
}