import React from 'react';

import {
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useApp } from '../context/AppContext';

import { styles } from './styles';

export default function InsightsScreen() {
  const { state } = useApp();

  const completedTasks =
    state.tasks.filter(
      (task) => task.completed
    ).length;

  const totalFocusMinutes =
    state.focusSessions.reduce(
      (total, session) =>
        total + session.durationMinutes,
      0
    );

  const averageMood =
    state.checkIns.length > 0
      ? state.checkIns.reduce(
          (total, checkIn) =>
            total + checkIn.mood,
          0
        ) / state.checkIns.length
      : null;

  const averageEnergy =
    state.checkIns.length > 0
      ? state.checkIns.reduce(
          (total, checkIn) =>
            total + checkIn.energy,
          0
        ) / state.checkIns.length
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContainer
      }
    >
      <Text style={styles.heading}>
        Insights
      </Text>

      <Text style={styles.text}>
        Here&#39;s a look at your recent activity.
      </Text>

      {/* Mood */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Average Mood
        </Text>

        <Text style={styles.largeMetric}>
          {averageMood !== null
            ? averageMood.toFixed(1)
            : '—'}{' '}
          / 5
        </Text>
      </View>

      {/* Energy */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Average Energy
        </Text>

        <Text style={styles.largeMetric}>
          {averageEnergy !== null
            ? averageEnergy.toFixed(1)
            : '—'}{' '}
          / 5
        </Text>
      </View>

      {/* Tasks */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Tasks Completed
        </Text>

        <Text style={styles.largeMetric}>
          {completedTasks}
        </Text>

        <Text style={styles.text}>
          completed tasks
        </Text>
      </View>

      {/* Focus */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Focus Time
        </Text>

        <Text style={styles.largeMetric}>
          {totalFocusMinutes}
        </Text>

        <Text style={styles.text}>
          total focus minutes
        </Text>
      </View>

      {/* Journal */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Journal Entries
        </Text>

        <Text style={styles.largeMetric}>
          {state.journalEntries.length}
        </Text>

        <Text style={styles.text}>
          entries recorded
        </Text>
      </View>

      {/* Patterns */}

      <View style={styles.card}>
        <Text style={styles.subheading}>
          Patterns
        </Text>

        {state.checkIns.length === 0 ? (
          <Text style={styles.text}>
            Complete a few check-ins to start
            seeing personal patterns.
          </Text>
        ) : (
          <Text style={styles.text}>
            Your insights will become more
            personalized as you use the app.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}