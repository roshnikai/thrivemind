
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { styles } from '../../styles/tabs';

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>Good morning!</Text>
      <Text style={styles.text}>
        Welcome back. Let&apos;s make today manageable.
      </Text>

      {/* Today's Tasks */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Today&apos;s Focus</Text>

        {state.tasks.length === 0 ? (
          <Text style={styles.text}>
            No tasks yet. Add a task to get started.
          </Text>
        ) : (
          state.tasks.map((task) => (
            <Text key={task.id} style={styles.text}>
              {task.completed ? '✓' : '○'} {task.title}
            </Text>
          ))
        )}
      </View>

      {/* Focus */}
      <View style={styles.card}>
        <Text style={styles.subheading}>
          Ready to focus?
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/focus')}
          accessibilityRole="button"
          accessibilityLabel="Start a focus session"
        >
          <Text style={styles.buttonText}>
            Start Focus Session
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick navigation */}
      <View style={styles.card}>
        <Text style={styles.subheading}>
          Take care of yourself
        </Text>
        <Text style={styles.text}>
          Check in with your mood, record a journal
          entry, or review your weekly progress.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/wellness')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            Open Wellness
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/insights')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            View Insights
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}