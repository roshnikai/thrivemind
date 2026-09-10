import React, { useEffect, useState } from 'react';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';
import { useApp } from '../context/AppContext';

const FOCUS_TIME = 25 * 60;

export default function FocusScreen() {

  const { dispatch } = useApp();

  const [seconds, setSeconds] =
    useState(FOCUS_TIME);

  const [running, setRunning] =
    useState(false);

  useEffect(() => {

    if (!running) {
      return;
    }

    const timer = setInterval(() => {

      setSeconds(current => {

        if (current <= 1) {
          setRunning(false);
          return FOCUS_TIME;
        }

        return current - 1;
      });

    }, 1000);

    return () => clearInterval(timer);

  }, [running]);

  

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    seconds % 60;

  const formattedTime =
    `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;

  useEffect(() => {
    if (formattedTime === "0:00") {
      dispatch({
        type: 'COMPLETE_FOCUS_SESSION',
        payload: 25,
      });
    }
  }, [dispatch, formattedTime]); // Triggers every time formattedTime changes


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
        onPress={() =>
          setRunning(!running)
        }
      >
        <Text style={styles.buttonText}>
          {running ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setRunning(false);
          setSeconds(FOCUS_TIME);
        }}
      >
        <Text style={styles.secondaryButtonText}>
          Reset
        </Text>
      </TouchableOpacity>

    </View>
  );
}