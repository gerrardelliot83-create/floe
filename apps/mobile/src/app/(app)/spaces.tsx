import React from 'react';
import { View, ScrollView } from 'react-native';
import { SmartSpaceManager } from '@floe/ui';
import { useAuth } from '@floe/ui';

export default function SpacesScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-lg">
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Please sign in to view smart spaces.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg-primary-light dark:bg-bg-primary-dark">
      <View className="p-lg">
        <SmartSpaceManager userId={user.id} />
      </View>
    </ScrollView>
  );
}