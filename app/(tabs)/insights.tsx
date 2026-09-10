import React from 'react';

import {
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from './styles';
import { useApp } from '../context/AppContext';

export default function InsightsScreen() {
  const { state } = useApp();

  const totalFocusMinutes =
    state.focusSessions.reduce(
      (total, session) =>
        total + session.duration,
      0
    );

  const now = new Date();

  const startOfWeek = new Date(now);
  const day = now.getDay(); // Sunday = 0, Monday = 1, etc.
  const diff = day === 0 ? 6 : day - 1; // Make Monday the start of the week

  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const journalEntriesThisWeek = state.journalEntries.filter(
    (entry) => new Date(entry.createdAt) >= startOfWeek
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >

      <Text style={styles.heading}>
        Insights
      </Text>

      <Text style={styles.text}>
        Here&#39;s a look at your recent patterns.
      </Text>

      {/* Mood */}

      <View style={styles.card}>
        <Text style={styles.heading}>
          {totalFocusMinutes}
        </Text>

        <Text style={styles.text}>
          Focus minutes this week
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>
          {journalEntriesThisWeek}
        </Text>

        <Text style={styles.text}>
          Journal entries this week
        </Text>
      </View>

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Mood
        </Text>

        <Text style={styles.heading}>
          {state.mood ?? 'Not recorded'} / 5
        </Text>

        <Text style={styles.text}>
          Average mood this week
        </Text>

      </View>

      {/* Tasks */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Productivity
        </Text>

        <Text style={styles.heading}>
          14
        </Text>

        <Text style={styles.text}>
          Tasks completed this week
        </Text>

      </View>

      {/* Pattern */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Patterns
        </Text>

        <Text style={styles.text}>
          💡 You tend to complete more tasks
          during morning focus sessions.
        </Text>

        <Text style={styles.text}>
          💡 Your energy appears to be
          highest in the morning.
        </Text>

      </View>

    </ScrollView>
  );
}