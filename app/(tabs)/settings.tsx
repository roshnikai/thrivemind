import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { styles } from './styles';
import { supabase } from '../../lib/supabase';

const interfaceStyles = ['Minimal', 'Visual', 'Text-focused'] as const;
const animationOptions = ['Normal', 'Reduced', 'Off'] as const;
const soundOptions = ['Normal', 'Minimal', 'Off'] as const;

type PreferenceKey = 'interfaceStyle' | 'animations' | 'sound';

export default function SettingsScreen() {
  const { state, savePreferences, clearAllData, dataError } = useApp();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [savingPreference, setSavingPreference] = useState<PreferenceKey | null>(null);
  const [clearingData, setClearingData] = useState(false);

  const handlePreferenceChange = async <K extends PreferenceKey>(
    key: K,
    value: (typeof state.preferences)[K],
  ) => {
    setSavingPreference(key);
    setPreferenceError(null);
    try {
      await savePreferences({ [key]: value });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPreferenceError(`Could not save this preference: ${message}`);
    } finally {
      setSavingPreference(null);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      // app/_layout.tsx reacts to SIGNED_OUT and removes the authenticated tabs.
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Unable to sign out. Please try again.';
      setSignOutError(message);
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Sign-out failed', message);
      }
    } finally {
      setSigningOut(false);
    }
  };

  const performClear = async () => {
    setClearingData(true);
    try {
      await clearAllData();
      if (Platform.OS === 'web') {
        window.alert('All data for this account was cleared.');
      } else {
        Alert.alert(
          'Data cleared',
          'This account’s tasks, check-ins, focus sessions, journal entries, and preferences were cleared.',
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (Platform.OS === 'web') {
        window.alert(`Could not clear data: ${message}`);
      } else {
        Alert.alert('Could not clear data', message);
      }
    } finally {
      setClearingData(false);
    }
  };

  const clearAllUserData = () => {
    const title = 'Clear all data for this account?';
    const message =
      'This deletes this account’s cloud tasks, mood check-ins, focus sessions, journal entries, and saved preferences. It cannot be undone.';

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        void performClear();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All Data',
        style: 'destructive',
        onPress: () => void performClear(),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.text}>Customize your workspace to suit your needs.</Text>

      {dataError ? (
        <Text style={[styles.text, { color: '#B42318', marginTop: 8 }]}>
          Account data could not be loaded: {dataError}
        </Text>
      ) : null}

      {preferenceError ? (
        <Text style={[styles.text, { color: '#B42318', marginTop: 8 }]}>
          {preferenceError}
        </Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.subheading}>Interface Style</Text>
        {interfaceStyles.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() => void handlePreferenceChange('interfaceStyle', option)}
            disabled={savingPreference === 'interfaceStyle'}
            accessibilityRole="button"
            accessibilityState={{ selected: state.preferences.interfaceStyle === option }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.interfaceStyle === option ? '✓ ' : '○ '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        {savingPreference === 'interfaceStyle' ? (
          <Text style={styles.text}>Saving interface style...</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.subheading}>Animations</Text>
        {animationOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() => void handlePreferenceChange('animations', option)}
            disabled={savingPreference === 'animations'}
            accessibilityRole="button"
            accessibilityState={{ selected: state.preferences.animations === option }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.animations === option ? '✓ ' : '○ '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        {savingPreference === 'animations' ? (
          <Text style={styles.text}>Saving animation preference...</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.subheading}>Sound</Text>
        {soundOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() => void handlePreferenceChange('sound', option)}
            disabled={savingPreference === 'sound'}
            accessibilityRole="button"
            accessibilityState={{ selected: state.preferences.sound === option }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.sound === option ? '✓ ' : '○ '}{option}
            </Text>
          </TouchableOpacity>
        ))}
        {savingPreference === 'sound' ? (
          <Text style={styles.text}>Saving sound preference...</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.subheading}>Data Management</Text>
        <Text style={styles.text}>
          Clear all activity and reset this account’s preferences to their defaults.
          The reset is limited to the account currently signed in.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#B42318' }, clearingData ? { opacity: 0.6 } : null]}
          onPress={clearAllUserData}
          disabled={clearingData}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {clearingData ? 'Clearing Data...' : 'Clear All Data'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.text}>This action cannot be undone.</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#475569', marginTop: 20 }]}
        onPress={() => void handleSignOut()}
        disabled={signingOut}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {signingOut ? 'Signing Out...' : 'Log Out'}
        </Text>
      </TouchableOpacity>

      {signOutError ? (
        <Text style={[styles.text, { color: '#B42318' }]}>{signOutError}</Text>
      ) : null}
    </ScrollView>
  );
}