import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {

  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = ['😞', '😐', '🙂', '😊', '😄'];

  const { state, dispatch } = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >

      <Text style={styles.heading}>
        Good morning!
      </Text>

      <Text style={styles.text}>
        How are you feeling today?
      </Text>

      {/* Daily Check-In */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Daily Check-In
        </Text>

        <Text style={styles.label}>
          Mood
        </Text>

        <View style={styles.moodRow}>

          {moods.map((emoji, index) => (

            <TouchableOpacity
              key={index}
              style={[
                styles.moodButton,
                mood === index + 1 &&
                  styles.moodButtonSelected,
              ]}
              onPress={() => {
                setMood(index + 1);
                dispatch({
                  type: 'SET_MOOD',
                  payload: index + 1,
                });
              }}
              accessibilityLabel={`Mood ${index + 1}`}
            >
              <Text style={styles.moodEmoji}>
                {emoji}
              </Text>
            </TouchableOpacity>

          ))}

        </View>

        <Text style={styles.label}>
          Energy: {energy ?? 'Not selected'}
        </Text>

        <View style={styles.moodRow}>

          {[1, 2, 3, 4, 5].map((value) => (

            <TouchableOpacity
              key={value}
              style={[
                styles.moodButton,
                energy === value &&
                  styles.moodButtonSelected,
              ]}
              onPress={() => setEnergy(value)}
              accessibilityLabel={`Energy ${value}`}
            >
              <Text>
                {value}
              </Text>
            </TouchableOpacity>

          ))}

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            console.log({ mood, energy })
          }
        >
          <Text style={styles.buttonText}>
            Save Check-In
          </Text>
        </TouchableOpacity>

      </View>

      {/* Today's Tasks */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Today&#39;s Focus
        </Text>

        {state.tasks.map(task => (
          <Text key={task.id}>
            {task.completed ? '✓' : '○'} {task.title}
          </Text>
        ))}

      </View>

      {/* Focus */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Ready to focus?
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Start Focus Session
          </Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}