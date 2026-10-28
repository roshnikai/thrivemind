import React, {useState} from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '../../context/AppContext';
import { styles } from './styles';

function getWeekStart(referenceDate: Date): Date {
  const start = new Date(referenceDate);

  // Use local time, with Monday as the first day.
  start.setHours(0, 0, 0, 0);

  const daysSinceMonday =
    (start.getDay() + 6) % 7;

  start.setDate(
    start.getDate() - daysSinceMonday
  );

  return start;
}

function isWithinWeek(
  timestamp: string | null | undefined,
  start: Date,
  nextStart: Date
): boolean {
  if (!timestamp) {
    return false;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= start && date < nextStart;
}

// Focus durations are stored to four decimal places in Supabase.
// Add scaled integers to avoid floating-point artifacts, then show
// all meaningful decimal digits without rounding to tenths.

function formatExactMinutes(
  sessions: { durationMinutes: number }[]
): string {
  // Sum scaled integers to reduce floating-point artifacts.
  const precision = 10000;

  const totalScaledMinutes = sessions.reduce(
    (total, session) =>
      total +
      Math.round(
        Number(session.durationMinutes) * precision
      ),
    0
  );

  return (totalScaledMinutes / precision)
    .toFixed(4)
    .replace(/(?:\.0+|(\.\d*?)0+)$/, '$1')
    .replace(/\.$/, '');
}

export default function InsightsScreen() {
  
  const { state, dataError, refreshAllData } = useApp();
  const [retrying, setRetrying] = useState(false);

  const weekStart = getWeekStart(new Date());

  // The next Monday is the exclusive end boundary.
  const nextWeekStart = new Date(weekStart);

  nextWeekStart.setDate(
    nextWeekStart.getDate() + 7
  );

  // Calculate the inclusive Sunday for display.
  const weekEnd = new Date(nextWeekStart);

  weekEnd.setDate(weekEnd.getDate() - 1);

  const startLabel = weekStart.toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
    }
  );

  const endLabel = weekEnd.toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  // Filter all event-based records to this week.
  const weeklyCheckIns = state.checkIns.filter(
    (entry) =>
      isWithinWeek(
        entry.createdAt,
        weekStart,
        nextWeekStart
      )
  );

  const weeklyFocusSessions =
    state.focusSessions.filter((session) =>
      isWithinWeek(
        session.completedAt,
        weekStart,
        nextWeekStart
      )
    );

  const weeklyJournalEntries =
    state.journalEntries.filter((entry) =>
      isWithinWeek(
        entry.createdAt,
        weekStart,
        nextWeekStart
      )
    );

  // Count currently completed tasks whose latest
  // completion occurred during this week.
  const weeklyCompletedTasks = state.tasks.filter(
    (task) =>
      task.completed &&
      isWithinWeek(
        task.completedAt,
        weekStart,
        nextWeekStart
      )
  );

  const averageMood =
    weeklyCheckIns.length > 0
      ? weeklyCheckIns.reduce(
          (total, entry) => total + entry.mood,
          0
        ) / weeklyCheckIns.length
      : null;

  const averageEnergy =
    weeklyCheckIns.length > 0
      ? weeklyCheckIns.reduce(
          (total, entry) => total + entry.energy,
          0
        ) / weeklyCheckIns.length
      : null;

  const focusMinutesLabel = formatExactMinutes(
    weeklyFocusSessions
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>
        Insights
      </Text>

      <Text style={styles.text}>
        Your activity for this week
      </Text>

      <Text style={styles.label}>
        {startLabel} – {endLabel}
      </Text>

      {dataError !== null && (
        <View style={styles.card}>
          <Text style={styles.text}>
            We couldn&apos;t load your latest data.
          </Text>

          <Text style={styles.text}>
            {dataError}
          </Text>

          <TouchableOpacity
            style={styles.button}
            disabled={retrying}
            accessibilityRole="button"
            accessibilityState={{ disabled: retrying }}
            onPress={async () => {
              if (retrying) return;

              setRetrying(true);

              try {
                await refreshAllData();
              } catch {
                // The provider should record the error in dataError.
              } finally {
                setRetrying(false);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {retrying ? 'Retrying...' : 'Retry Loading'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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

        <Text style={styles.text}>
          Based on {weeklyCheckIns.length}{' '}
          {weeklyCheckIns.length === 1
            ? 'check-in'
            : 'check-ins'} this week.
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
          Tasks Completed This Week
        </Text>

        <Text style={styles.largeMetric}>
          {weeklyCompletedTasks.length}
        </Text>
      </View>

      {/* Focus */}
      <View style={styles.card}>
        <Text style={styles.subheading}>
          Focus Time This Week
        </Text>

        <Text style={styles.largeMetric}>
          {focusMinutesLabel}
        </Text>

        <Text style={styles.text}>
          minutes across{' '}
          {weeklyFocusSessions.length}{' '}
          completed focus sessions.
        </Text>
      </View>

      {/* Journaling */}
      <View style={styles.card}>
        <Text style={styles.subheading}>
          Journal Entries This Week
        </Text>

        <Text style={styles.largeMetric}>
          {weeklyJournalEntries.length}
        </Text>
      </View>

      {/* Patterns */}
      <View style={styles.card}>
        <Text style={styles.subheading}>
          Your Weekly Patterns
        </Text>

        {weeklyCheckIns.length === 0 &&
        weeklyFocusSessions.length === 0 &&
        weeklyCompletedTasks.length === 0 &&
        weeklyJournalEntries.length === 0 ? (
          <Text style={styles.text}>
            No activity recorded this week yet.
            Complete a check-in, task, focus
            session, or journal entry to get started.
          </Text>
        ) : (
          <Text style={styles.text}>
            These summaries reflect activity
            recorded this week. More personalized
            patterns can be added as your app
            develops.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}