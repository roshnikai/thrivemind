import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. Import useRouter from expo-router
import { useRouter } from 'expo-router'; 

import { useApp } from '../context/AppContext';
import { styles } from './styles';

export default function HomeScreen() {
  // 2. Initialize the router
  const router = useRouter(); 
  const { state, dispatch } = useApp();

  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = ['😞', '😐', '🙂', '😊', '😄'];

  const saveCheckIn = () => {
    if (mood === null || energy === null) {
      return;
    }

    dispatch({
      type: 'ADD_CHECK_IN',
      payload: {
        mood,
        energy,
      },
    });

    setMood(null);
    setEnergy(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>Good morning!</Text>
      <Text style={styles.text}>How are you feeling today?</Text>

      {/* Daily Check-In */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Daily Check-In</Text>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodRow}>
          {moods.map((emoji, index) => {
            const value = index + 1;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.moodButton,
                  mood === value && styles.moodButtonSelected,
                ]}
                onPress={() => setMood(value)}
                accessibilityRole="button"
                accessibilityLabel={`Mood ${value} out of 5`}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Energy</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.moodButton,
                energy === value && styles.moodButtonSelected,
              ]}
              onPress={() => setEnergy(value)}
              accessibilityRole="button"
              accessibilityLabel={`Energy ${value} out of 5`}
            >
              <Text style={styles.text}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={saveCheckIn}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Save Check-In</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Tasks */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Today&#39;s Focus</Text>
        {state.tasks.length === 0 ? (
          <Text style={styles.text}>No tasks yet.</Text>
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
        <Text style={styles.subheading}>Ready to focus?</Text>

        <TouchableOpacity 
          style={styles.button}
          // 3. Navigate to the /focus route on press
          onPress={() => router.push('/focus')} 
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Start Focus Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
