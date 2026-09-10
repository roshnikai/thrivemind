import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';
import { useApp } from '../context/AppContext';

export default function WellnessScreen() {

  const [journal, setJournal] = useState('');
  const {dispatch} = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >

      <Text style={styles.heading}>
        Wellness
      </Text>

      <Text style={styles.text}>
        Take a moment to check in with yourself.
      </Text>

      {/* Journal */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Journal
        </Text>

        <Text style={styles.label}>
          What&#39;s on your mind?
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              height: 120,
              textAlignVertical: 'top',
            },
          ]}
          multiline
          value={journal}
          onChangeText={setJournal}
          placeholder="Write whatever you'd like..."
          accessibilityLabel="Journal entry"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            dispatch({
              type: 'ADD_JOURNAL_ENTRY',
              payload: journal,
            })
          }
        >
          <Text style={styles.buttonText}>
            Save Journal Entry
          </Text>
        </TouchableOpacity>

      </View>

      {/* Wellness Tools */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Wellness Tools
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            🫁 Breathing Exercise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            🧠 Thought Exercise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            🌱 Grounding Exercise
          </Text>
        </TouchableOpacity>

      </View>

      {/* Resources */}

      <View style={styles.card}>

        <Text style={styles.subheading}>
          Resources
        </Text>

        <Text style={styles.text}>
          Find professional mental-health,
          workplace, and accessibility resources.
        </Text>

        <TouchableOpacity
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            View Resources
          </Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}