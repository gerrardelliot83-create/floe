import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@floe/ui';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) {
          setError(error.message);
        } else {
          router.replace('/(app)');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.replace('/(app)');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setError(error.message);
      } else {
        // Show success message
        setError('Check your email for a magic link!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-lg py-xl">
          <View className="mb-xl">
            <Text className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
              {mode === 'signin' ? 'Sign in to continue' : 'Start organizing your knowledge'}
            </Text>
          </View>

          {error && (
            <View className="mb-lg p-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <Text className="text-red-800 dark:text-red-200 text-sm">{error}</Text>
            </View>
          )}

          <View className="space-y-lg">
            {mode === 'signup' && (
              <View>
                <Text className="text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                  Full name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  className="input-minimal"
                  placeholder="Your name"
                  autoComplete="name"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View>
              <Text className="text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="input-minimal"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="input-minimal"
                placeholder="Enter password"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {mode === 'signup' && (
              <View>
                <Text className="text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                  Confirm password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="input-minimal"
                  placeholder="Confirm password"
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            )}

            <View className="space-y-sm pt-md">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-text-primary-light dark:bg-text-primary-dark px-md py-sm"
              >
                <Text className="text-background-light dark:text-background-dark text-sm font-medium text-center">
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMagicLink}
                disabled={loading || !email}
                className="border border-text-primary-light dark:border-text-primary-dark px-md py-sm"
              >
                <Text className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium text-center">
                  Send magic link
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-xl pt-xl border-t border-border-light dark:border-border-dark">
            <TouchableOpacity
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={loading}
            >
              <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Text className="text-text-primary-light dark:text-text-primary-dark underline">
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}