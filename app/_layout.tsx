import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { AppProvider } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error('Session loading failed:', error);

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
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log('[ROOT AUTH EVENT]', event);
      if (!mounted) return;

      setSession(nextSession);

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveringPassword(true);
      }

      if (event === 'SIGNED_OUT') {
        setRecoveringPassword(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    // Recovery screen takes priority over ordinary authentication.
    if (recoveringPassword) {
      if (pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
      return;
    }

    // Ordinary authentication redirects.
    if (session && pathname === '/sign-in') {
      router.replace('/(tabs)');
    }

    if (!session && pathname.startsWith('/(tabs)')) {
      router.replace('/sign-in');
    }
  }, [
    loading,
    session,
    recoveringPassword,
    pathname,
    router,
  ]);

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

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="sign-in" />

        <Stack.Protected guard={!!session && !recoveringPassword}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </AppProvider>
  );
}