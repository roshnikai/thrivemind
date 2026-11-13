
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';

import { useApp } from '../../context/AppContext';
import { styles } from '../../styles/tabs';
import * as Crypto from 'expo-crypto';

const FOCUS_DURATIONS = [15, 25, 30, 45, 60] as const;

type FocusDuration = number;

export default function FocusScreen() {
  const { addFocusSession } = useApp();

  const [selectedDuration, setSelectedDuration] =
    useState<FocusDuration>(25);

  const [secondsRemaining, setSecondsRemaining] =
    useState(25 * 60);

  const [running, setRunning] = useState(false);

  const [savingError, setSavingError] =
    useState<string | null>(null);

  const [savingSession, setSavingSession] = useState(false);

  // Retain the completed duration if the Supabase save fails.
  const [pendingDuration, setPendingDuration] =
    useState<number | null>(null);

  // Store the actual deadline to reduce timer drift.
  const endTimeRef = useRef<number | null>(null);

  // Prevent multiple saves from repeated timer updates.
  const completionStartedRef = useRef(false);

  const [customDuration, setCustomDuration] = useState('');
  const [customDurationError, setCustomDurationError] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const applyCustomDuration = () => {
    const duration = Number(customDuration);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 180
    ) {
      setCustomDurationError(
        'Enter a whole number between 1 and 180 minutes.'
      );
      return;
    }

    setSelectedDuration(duration);
    setSecondsRemaining(duration * 60);
    setCustomDurationError(null);
    setSavingError(null);
  };

  const saveCompletedSession = useCallback(
    async (duration: number, sessionId: string) => {
      setSavingSession(true);
      setSavingError(null);
      
      try {
        await addFocusSession(duration, sessionId);

        // Only reset the timer after Supabase confirms the save.
        setPendingDuration(null);
        setSecondsRemaining(selectedDuration * 60);
        completionStartedRef.current = false;
      } catch (error) {
        setPendingDuration(duration);

        setSavingError(
          error instanceof Error
            ? error.message
            : 'Unable to save the focus session.'
        );
      } finally {
        setSavingSession(false);
      }
    },
    [addFocusSession, selectedDuration]
  );

  // Update the countdown based on the actual deadline.
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      if (endTimeRef.current === null) return;

      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );

      setSecondsRemaining(remaining);

      if (remaining === 0) {
        setRunning(false);
        endTimeRef.current = null;

        if (!completionStartedRef.current) {
          completionStartedRef.current = true;
          const sessionId = Crypto.randomUUID();
          setPendingDuration(selectedDuration);
          setPendingSessionId(sessionId);
          void saveCompletedSession(selectedDuration, sessionId);
        }
      }
    }, 250);

    return () => clearInterval(timer);
  }, [running, selectedDuration, saveCompletedSession]);

  const selectDuration = (duration: FocusDuration) => {
    if (running || savingSession || pendingDuration !== null) {
      return;
    }

    setSelectedDuration(duration);
    setSecondsRemaining(duration * 60);
    setSavingError(null);
  };

  const toggleTimer = () => {
    if (savingSession || pendingDuration !== null) return;

    if (running) {
      // Pause and preserve the actual remaining time.
      if (endTimeRef.current !== null) {
        const remaining = Math.max(
          0,
          Math.ceil((endTimeRef.current - Date.now()) / 1000)
        );

        setSecondsRemaining(remaining);
      }

      endTimeRef.current = null;
      setRunning(false);
      return;
    }

    if (secondsRemaining <= 0) return;

    completionStartedRef.current = false;

    endTimeRef.current =
      Date.now() + secondsRemaining * 1000;

    setRunning(true);
  };

  const resetTimer = () => {
    if (savingSession || pendingDuration !== null) return;

    setRunning(false);
    endTimeRef.current = null;
    completionStartedRef.current = false;

    setSecondsRemaining(selectedDuration * 60);
    setSavingError(null);
  };

  const retrySave = () => {
    if (pendingDuration === null || savingSession) return;

    const sessionId = Crypto.randomUUID();
    setPendingDuration(selectedDuration);
    setPendingSessionId(sessionId);
    void saveCompletedSession(selectedDuration, sessionId);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime =
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const durationSelectionDisabled =
    running || savingSession || pendingDuration !== null;

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.heading}>Focus</Text>

      <Text style={styles.text}>
        Choose your focus duration
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginVertical: 16,
        }}
      >
        {FOCUS_DURATIONS.map((duration) => {
          const selected = selectedDuration === duration;

          return (
            <TouchableOpacity
              key={duration}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                margin: 4,
                borderRadius: 8,
                backgroundColor: selected ? '#2563EB' : '#E5E7EB',
                opacity: durationSelectionDisabled ? 0.55 : 1,
              }}
              onPress={() => selectDuration(duration)}
              disabled={durationSelectionDisabled}
              accessibilityRole="button"
              accessibilityState={{
                selected,
                disabled: durationSelectionDisabled,
              }}
              accessibilityLabel={`${duration} minutes`}
            >
              <Text
                style={{
                  color: selected ? '#FFFFFF' : '#1F2937',
                  fontWeight: selected ? 'bold' : 'normal',
                }}
              >
                {duration} min
              </Text>
            </TouchableOpacity>
          );
        })}   
      </View>

      <View style={{ width: '80%', marginBottom: 16 }}>
        <Text style={styles.text}>Custom duration (minutes)</Text>

        <TextInput
          value={customDuration}
          onChangeText={setCustomDuration}
          placeholder="Enter minutes (1–180)"
          keyboardType="number-pad"
          editable={!durationSelectionDisabled}
          style={{
            borderWidth: 1,
            borderColor: '#9CA3AF',
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            color: '#1F2937',
          }}
          accessibilityLabel="Custom focus duration in minutes"
        />

        {customDurationError !== null && (
          <Text style={{ color: '#B42318', marginTop: 6 }}>
            {customDurationError}
          </Text>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={applyCustomDuration}
          disabled={durationSelectionDisabled}
        >
          <Text style={styles.secondaryButtonText}>
            Apply Custom Duration
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.timer}>{formattedTime}</Text>

      <Text style={styles.text}>Deep Work</Text>

      {savingError !== null && (
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <Text
            style={[
              styles.text,
              { color: '#B42318', marginBottom: 8 },
            ]}
          >
            Session could not be saved: {savingError}
          </Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={retrySave}
            disabled={savingSession}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              {savingSession ? 'Retrying...' : 'Retry Save'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {savingSession && (
        <Text style={styles.text}>
          Saving completed session...
        </Text>
      )}

      <TouchableOpacity
        style={styles.startFocusButton}
        onPress={toggleTimer}
        disabled={savingSession || pendingDuration !== null}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {running ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={resetTimer}
        disabled={savingSession || pendingDuration !== null}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
}
