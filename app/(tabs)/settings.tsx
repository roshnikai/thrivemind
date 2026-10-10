
import React from 'react';

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

const interfaceStyles = [
  'Minimal',
  'Visual',
  'Text-focused',
] as const;

const animationOptions = [
  'Normal',
  'Reduced',
  'Off',
] as const;

const soundOptions = [
  'Normal',
  'Minimal',
  'Off',
] as const;

export default function SettingsScreen() {
  const { state, dispatch } = useApp();

  const clearAllData = () => {
    const title = 'Clear all data?';

    const message =
      'This permanently deletes your tasks, mood and energy check-ins, focus sessions, journal entries, and saved preferences from this device. This cannot be undone.';

    const performClear = () => {
      dispatch({
        type: 'CLEAR_ALL_DATA',
      });
    };

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(`${title}\n\n${message}`)
      ) {
        performClear();
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear All Data',
        style: 'destructive',
        onPress: performClear,
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>
        Settings
      </Text>

      <Text style={styles.text}>
        Customize your workspace to suit your needs.
      </Text>

      {/* Interface Style */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Interface Style
        </Text>

        {interfaceStyles.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() =>
              dispatch({
                type: 'SET_INTERFACE_STYLE',
                payload: option,
              })
            }
            accessibilityRole="button"
            accessibilityState={{
              selected:
                state.preferences.interfaceStyle ===
                option,
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.interfaceStyle ===
              option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Animation Settings */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Animations
        </Text>

        {animationOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() =>
              dispatch({
                type: 'SET_ANIMATIONS',
                payload: option,
              })
            }
            accessibilityRole="button"
            accessibilityState={{
              selected:
                state.preferences.animations ===
                option,
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.animations ===
              option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sound Settings */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Sound
        </Text>

        {soundOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() =>
              dispatch({
                type: 'SET_SOUND',
                payload: option,
              })
            }
            accessibilityRole="button"
            accessibilityState={{
              selected:
                state.preferences.sound ===
                option,
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {state.preferences.sound === option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data Management */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Data Management
        </Text>

        <Text style={styles.text}>
          Reset this prototype by removing all saved
          activity and returning preferences to
          their defaults.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: '#B42318' },
          ]}
          onPress={clearAllData}
          accessibilityRole="button"
          accessibilityLabel="Clear all app data"
        >
          <Text style={styles.buttonText}>
            Clear All Data
          </Text>
        </TouchableOpacity>

        <Text style={styles.text}>
          This action cannot be undone.
        </Text>
      </View>
    </ScrollView>
  );
}