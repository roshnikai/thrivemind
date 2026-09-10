import React from 'react';
import { Stack } from 'expo-router';

import { AppProvider } from './context/AppContext';

export default function RootLayout() {

  return (
    <AppProvider>

      <Stack>

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />

      </Stack>

    </AppProvider>
  );
}