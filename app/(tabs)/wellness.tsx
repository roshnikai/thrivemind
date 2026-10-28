import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { styles } from './styles';

const scale = [1, 2, 3, 4, 5];

export default function WellnessScreen() {
  const { state, addCheckIn, addJournalEntry, dataError } = useApp();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [journal, setJournal] = useState('');
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [wellnessError, setWellnessError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  const handleSaveCheckIn = async () => {
    if (mood === null || energy === null || savingCheckIn) {
      return;
    }

    setSavingCheckIn(true);
    setSaveMessage(null);

    try {
      await addCheckIn(mood, energy);
      setMood(null);
      setEnergy(null);
      setSaveMessage('Check-in saved successfully.');
    } catch {
      setSaveMessage('Could not save your check-in. Please try again.');
    } finally {
      setSavingCheckIn(false);
    }
  };

  const saveJournalEntry = async () => {
    const trimmedJournal = journal.trim();
    if (!trimmedJournal) {
      setWellnessError('Write a journal entry before saving.');
      return;
    }

    setSavingJournal(true);
    setWellnessError(null);
    try {
      await addJournalEntry(trimmedJournal);
      setJournal('');
    } catch (error) {
      setWellnessError(
        error instanceof Error ? error.message : 'Unable to save your journal entry.'
      );
    } finally {
      setSavingJournal(false);
    }
  };

  const renderScale = (
    label: string,
    selectedValue: number | null,
    setSelectedValue: (value: number) => void,
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {scale.map((value, index) => {
          const selected = selectedValue === value;
          return (
            <TouchableOpacity
              key={value}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 11,
                marginRight: index === scale.length - 1 ? 0 : 8,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: selected ? '#2563EB' : '#CBD5E1',
                backgroundColor: selected ? '#EAF2FF' : '#FFFFFF',
              }}
              onPress={() => setSelectedValue(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}, ${value} out of 5`}
            >
              <Text style={styles.secondaryButtonText}>{value}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <Text style={styles.heading}>Wellness</Text>
      <Text style={styles.text}>Take a moment to check in with yourself.</Text>

      {dataError ? (
        <Text style={[styles.text, { color: '#B42318', marginTop: 8 }]}>
          Account data could not be loaded: {dataError}
        </Text>
      ) : null}

      {wellnessError ? (
        <Text style={[styles.text, { color: '#B42318', marginTop: 8 }]}>
          {wellnessError}
        </Text>
      ) : null}

      {/* Account-specific mood and energy check-in */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Mood Check-in</Text>
        <Text style={styles.text}>Use a 1-5 scale, where 1 is low and 5 is high.</Text>

        {renderScale('How is your mood?', mood, setMood)}
        {renderScale('How is your energy?', energy, setEnergy)}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveCheckIn}
          disabled={savingCheckIn}
          accessibilityRole="button"
          accessibilityState={{ disabled: savingCheckIn }}
        >
          <Text style={styles.buttonText}>
            {savingCheckIn ? 'Saving...' : 'Save Check-In'}
          </Text>
        </TouchableOpacity>

        {saveMessage !== null && (
          <Text accessibilityRole="text">
            {saveMessage}
          </Text>
        )}
      </View>

      {/* Account-specific journal entries */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Journal</Text>
        <Text style={styles.label}>What&apos;s on your mind?</Text>
        <TextInput
          style={[
            styles.input,
            { minHeight: 120, textAlignVertical: 'top' },
          ]}
          multiline
          value={journal}
          onChangeText={setJournal}
          placeholder="Write whatever you'd like..."
          accessibilityLabel="Journal entry"
        />
        <TouchableOpacity
          style={[styles.button, savingJournal ? { opacity: 0.6 } : null]}
          onPress={() => void saveJournalEntry()}
          disabled={savingJournal}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {savingJournal ? 'Saving Entry...' : 'Save Journal Entry'}
          </Text>
        </TouchableOpacity>
      </View>

      {state.checkIns.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.subheading}>Recent Check-ins</Text>
          {state.checkIns.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.text}>
              Mood {item.mood}/5 · Energy {item.energy}/5 ·{' '}
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          ))}
        </View>
      ) : null}

      {state.journalEntries.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.subheading}>Recent Journal Entries</Text>
          {state.journalEntries.slice(0, 3).map((entry) => (
            <View key={entry.id} style={{ marginBottom: 12 }}>
              <Text style={styles.text}>{entry.text}</Text>
              <Text style={[styles.text, { opacity: 0.7 }]}>
                {new Date(entry.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Wellness tools */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Wellness Tools</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Breathing Exercise', 'A breathing exercise will be available here.')}
        >
          <Text style={styles.secondaryButtonText}>Breathing Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Thought Exercise', 'A thought exercise will be available here.')}
        >
          <Text style={styles.secondaryButtonText}>Thought Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => Alert.alert('Grounding Exercise', 'A grounding exercise will be available here.')}
        >
          <Text style={styles.secondaryButtonText}>Grounding Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Resources */}
      <View style={styles.card}>
        <Text style={styles.subheading}>Resources</Text>
        <Text style={styles.text}>
          Find professional mental-health, workplace, and accessibility resources.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert('Resources', 'Resource links will be available here.')}
        >
          <Text style={styles.buttonText}>View Resources</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}