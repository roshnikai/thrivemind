import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  const [recoveryLink, setRecoveryLink] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoveryLink = () => {
      if (typeof window === 'undefined') {
        return false;
      }

      const url = new URL(window.location.href);

      const code = url.searchParams.get('code');

      const hashParams = new URLSearchParams(
        url.hash.startsWith('#')
          ? url.hash.slice(1)
          : url.hash
      );

      const recoveryType = hashParams.get('type');

      return (
        !!code ||
        recoveryType === 'recovery'
      );
    };

    const loadSession = async () => {
      try {
        const isRecoveryLink = checkRecoveryLink();

        if (mounted) {
          setRecoveryLink(isRecoveryLink);
        }

        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (mounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error(
          'Failed to load session:',
          error
        );

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        console.log('[INDEX AUTH EVENT]', _event);
        console.log(
          '[INDEX SESSION]',
          nextSession?.user?.id ?? 'No session'
        );
        if (mounted) {
          setSession(nextSession);
          setLoading(false);
        }
      }
    );
    console.log('[INDEX SCREEN] Rendered');
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Recovery links must go to the password reset screen.
  if (recoveryLink) {
    return <Redirect href="/reset-password" />;
  }
  console.log('[INDEX REDIRECT]', {
  hasSession: !!session,
  destination: session ? '/(tabs)' : '/sign-in',
  currentUrl:
    Platform.OS === 'web'
      ? window.location.href
      : 'Native',
  });
  return (
    <Redirect
      href={session ? '/(tabs)' : '/sign-in'}
    />
  );
}