
import React, { useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function SignInScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>(
    'signin'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage('Enter your email and password.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signin') {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (error) throw error;

        setMessage('Signed in successfully!');
        // The root layout will detect the new session
        // and automatically display the employee app.
      } else {
        const { data, error } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
          });

        if (error) throw error;

        if (data.session) {
          setMessage('Account created successfully!');
        } else {
          setMessage(
            'Account created. Check your email to confirm ' +
            'your account, then sign in here.'
          );
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((current) =>
      current === 'signin' ? 'signup' : 'signin'
    );
    setMessage('');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>ThriveMind</Text>

        <Text style={styles.subtitle}>
          A workspace designed around your needs.
        </Text>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          accessibilityLabel="Email address"
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={
            mode === 'signin' ? 'current-password' : 'new-password'
          }
          accessibilityLabel="Password"
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {!!message && (
          <Text accessibilityRole="text" style={styles.message}>
            {message}
          </Text>
        )}

        <TouchableOpacity
          onPress={switchMode}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
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
    fontSize: 30,
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
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
  },
  switchText: {
    color: '#4C6EF5',
    fontSize: 15,
    textAlign: 'center',
  },
});
