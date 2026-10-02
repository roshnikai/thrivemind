import React, { useEffect, useState } from 'react';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '../context/AppContext';

import { styles } from './styles';

const FOCUS_DURATION_MINUTES = 25;
const FOCUS_DURATION_SECONDS =
  FOCUS_DURATION_MINUTES * 60;

export default function FocusScreen() {
  const { dispatch } = useApp();

  const [secondsRemaining, setSecondsRemaining] =
    useState(FOCUS_DURATION_SECONDS);

  const [running, setRunning] =
    useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          clearInterval(timer);

          setRunning(false);

          dispatch({
            type: 'ADD_FOCUS_SESSION',
            payload: FOCUS_DURATION_MINUTES,
          });

          return FOCUS_DURATION_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, dispatch]);

  const minutes = Math.floor(
    secondsRemaining / 60
  );

  const seconds = secondsRemaining % 60;

  const formattedTime =
    `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;

  const resetTimer = () => {
    setRunning(false);
    setSecondsRemaining(
      FOCUS_DURATION_SECONDS
    );
  };

  return (
    <View
      style={[
        styles.container,
        styles.center,
      ]}
    >
      <Text style={styles.heading}>
        Focus
      </Text>

      <Text style={styles.timer}>
        {formattedTime}
      </Text>

      <Text style={styles.text}>
        Deep Work
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setRunning(!running)}
      >
        <Text style={styles.buttonText}>
          {running ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={resetTimer}
      >
        <Text style={styles.secondaryButtonText}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
}