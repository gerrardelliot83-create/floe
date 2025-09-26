import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@floe/ui';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(app)');
      } else {
        router.replace('/auth');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 justify-center items-center">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-lg py-xxxl">
        <View className="max-w-lg">
          <Text className="text-display font-light text-text-primary-light dark:text-text-primary-dark mb-xl">
            Floe
          </Text>
          <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-xl">
            Privacy-focused personal knowledge management system with AI-powered
            auto-organization. Save, organize, and discover your content without
            manual tagging or folders.
          </Text>
          <View className="flex-col space-y-sm">
            <TouchableOpacity
              className="bg-text-primary-light dark:bg-text-primary-dark px-md py-sm"
              onPress={() => router.push('/auth')}
            >
              <Text className="text-background-light dark:text-background-dark text-sm font-medium text-center">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}