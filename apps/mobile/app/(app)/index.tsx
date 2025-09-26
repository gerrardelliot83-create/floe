import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@floe/ui';

export default function AppHomeScreen() {
  const { user, profile, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-lg py-xl">
        <View className="flex-row justify-between items-center mb-xl">
          <Text className="text-xl font-light text-text-primary-light dark:text-text-primary-dark">
            Welcome to Floe
          </Text>
          <TouchableOpacity onPress={() => signOut()}>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Sign out
            </Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-lg">
          <View className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <Text className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
              Your Profile
            </Text>
            <View className="space-y-xs">
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Name: {profile?.full_name || 'Not set'}
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Email: {user?.email}
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Username: {profile?.username || 'Not set'}
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Storage used: {profile?.storage_used_bytes || 0} bytes
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Subscription: {profile?.subscription_tier || 'free'}
              </Text>
            </View>
          </View>

          <View className="space-y-md">
            <TouchableOpacity className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <Text className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Quick Capture
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                Add notes, links, or files instantly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <Text className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Search
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                Find anything in your knowledge base
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
              <Text className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-sm">
                Smart Spaces
              </Text>
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-md">
                AI-organized collections
              </Text>
            </TouchableOpacity>
          </View>

          <View className="text-center py-xl">
            <Text className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm text-center">
              Your knowledge management system is ready. Start by adding your first piece of content.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}