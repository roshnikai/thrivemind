import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native';

import { styles } from './(tabs)/styles';
import { useApp } from './context/AppContext';

export default function SettingsScreen() {

  const [interfaceStyle, setInterfaceStyle] =
    useState('Minimal');

  const [animations, setAnimations] =
    useState('Reduced');

  const [sound, setSound] =
    useState('Off');

  const {dispatch} = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >

      <Text style={styles.heading}>
        Settings
      </Text>

      <Text style={styles.subheading}>
        Interface Style
      </Text>

      {(['Minimal', 'Visual', 'Text-focused'] as const).map(
        option => (

          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() => {
              setInterfaceStyle(option);
              dispatch({
                type: 'SET_INTERFACE_STYLE',
                payload: option
              });
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {interfaceStyle === option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>

        )
      )}

      <Text style={styles.subheading}>
        Animations
      </Text>

      {['Normal', 'Reduced', 'Off'].map(
        option => (

          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() =>
              setAnimations(option)
            }
          >
            <Text style={styles.secondaryButtonText}>
              {animations === option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>

        )
      )}

      <Text style={styles.subheading}>
        Sound
      </Text>

      {['Normal', 'Minimal', 'Off'].map(
        option => (

          <TouchableOpacity
            key={option}
            style={styles.secondaryButton}
            onPress={() =>
              setSound(option)
            }
          >
            <Text style={styles.secondaryButtonText}>
              {sound === option
                ? '✓ '
                : '○ '}
              {option}
            </Text>
          </TouchableOpacity>

        )
      )}

    </ScrollView>
  );
}