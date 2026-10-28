import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { styles } from './styles';

// Keep the short 15-second duration for the current prototype/demo timer.
// This is stored as 0.25 minutes in the numeric database column.
const FOCUS_DURATION_MINUTES = 0.25;
const FOCUS_DURATION_SECONDS = FOCUS_DURATION_MINUTES * 60;

export default function FocusScreen() {
  const { addFocusSession } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState(FOCUS_DURATION_SECONDS);
  const [running, setRunning] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running || secondsRemaining > 0) return;

    setRunning(false);
    setSecondsRemaining(FOCUS_DURATION_SECONDS);
    setSavingError(null);
    setSavingSession(true);

    void addFocusSession(FOCUS_DURATION_MINUTES)
      .catch((error) => {
        setSavingError(
          error instanceof Error ? error.message : 'Unable to save the focus session.'
        );
      })
      .finally(() => setSavingSession(false));
  }, [running, secondsRemaining, addFocusSession]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const resetTimer = () => {
    setRunning(false);
    setSecondsRemaining(FOCUS_DURATION_SECONDS);
    setSavingError(null);
  };

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.heading}>Focus</Text>
      <Text style={styles.timer}>{formattedTime}</Text>
      <Text style={styles.text}>Deep Work</Text>

      {savingError ? (
        <Text style={[styles.text, { color: '#B42318', marginBottom: 12 }]}>
          Session could not be saved: {savingError}
        </Text>
      ) : null}
      {savingSession ? <Text style={styles.text}>Saving completed session...</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setRunning((current) => !current)}
        disabled={savingSession}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{running ? 'Pause' : 'Start'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={resetTimer}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}