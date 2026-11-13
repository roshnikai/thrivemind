import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

export default function ResetPasswordScreen() {
  console.log(
  '[RESET PASSWORD SCREEN] Current URL:',
  Platform.OS === 'web'
    ? window.location.href
    : 'Not running on web'
);
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [message, setMessage] = useState('');
  const [recoveryEventReceived, setRecoveryEventReceived] = useState(false);
  const processedUrls = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log('[RESET AUTH EVENT]', event);

      if (event === 'PASSWORD_RECOVERY' && mounted) {
        setRecoveryReady(true);
      }
    });

    const initializeRecovery = async (incomingUrl: string | null) => {
      if (!mounted) return;

      try {
        setLoading(true);
        setMessage('');

        if (incomingUrl) {
          // Avoid processing the same deep link twice.
          if (processedUrls.current.has(incomingUrl)) {
            return;
          }

          processedUrls.current.add(incomingUrl);

          console.log('[RECOVERY URL]', incomingUrl);

          const url = new URL(incomingUrl);
          const code = url.searchParams.get('code');

          const hashParams = new URLSearchParams(
            url.hash.startsWith('#')
              ? url.hash.slice(1)
              : url.hash
          );

          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const recoveryType = hashParams.get('type');

          // Supabase PKCE recovery format: ?code=...
          if (code) {
            const { error } =
              await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              throw error;
            }
          }
          // Supabase token recovery format:
          // #access_token=...&refresh_token=...&type=recovery
          else if (
            accessToken &&
            refreshToken &&
            recoveryType === 'recovery'
          ) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw error;
            }
          } else {
            throw new Error(
              'The recovery link is missing its recovery credentials. Please request a new password reset email.'
            );
          }
        }

        // Confirm that Supabase has established a session.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error(
            'The recovery link is invalid, expired, or missing its recovery credentials. Please request a new password reset email.'
          );
        }

        if (mounted) {
          setRecoveryReady(true);
        }
      } catch (error) {
        console.error('Recovery initialization failed:', error);

        if (mounted) {
          setRecoveryReady(false);
          setMessage(
            error instanceof Error
              ? error.message
              : 'Unable to verify your recovery link.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for links received while the app is already running.
    const linkingSubscription =
      Platform.OS !== 'web'
        ? Linking.addEventListener('url', ({ url }) => {
            void initializeRecovery(url);
          })
        : null;

    // Handle the URL that launched the app, or the current web URL.
    const loadInitialUrl = async () => {
      if (Platform.OS === 'web') {
        await initializeRecovery(
          typeof window !== 'undefined' ? window.location.href : null
        );
      } else {
        const initialUrl = await Linking.getInitialURL();
        await initializeRecovery(initialUrl);
      }
    };

    void loadInitialUrl();

    console.log('[RESET PASSWORD SCREEN] Rendered');

    return () => {
      mounted = false;
      subscription.unsubscribe();
      linkingSubscription?.remove();
    };
  }, []);

  const handleUpdatePassword = async () => {
    setMessage('');

    if (password.length < 8) {
      setMessage('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!data.session) {
        throw new Error(
          'Your recovery session has expired. Please request a new reset email.'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace('/sign-in');
    } catch (error) {
      console.error('Password update failed:', error);

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update your password. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color="#4C6EF5" />
        <Text style={styles.loadingText}>
          Verifying recovery link...
        </Text>
      </View>
    );
  }

  if (!recoveryReady) {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.card}>
          <Text style={styles.title}>Password recovery</Text>

          <Text style={styles.message}>
            {message ||
              'Your recovery link could not be verified. Please request a new one.'}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/sign-in')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Return to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Reset your password</Text>

        <Text style={styles.subtitle}>
          Enter and confirm your new password.
        </Text>

        <Text style={styles.label}>New password</Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter new password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          editable={!saving}
          accessibilityLabel="New password"
        />

        <Text style={styles.label}>Confirm password</Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          editable={!saving}
          accessibilityLabel="Confirm new password"
        />

        <TouchableOpacity
          style={[styles.button, saving && styles.disabledButton]}
          onPress={handleUpdatePassword}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Update password</Text>
          )}
        </TouchableOpacity>

        {!!message && (
          <Text accessibilityRole="text" style={styles.message}>
            {message}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FBFF',
  },
  loadingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#475569',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#4C6EF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: '#374151',
    marginTop: 16,
  },
});