import React, { useState } from 'react';

import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '../../context/AppContext';

import { supabase } from '../../lib/supabase';
import { styles } from './styles';

export default function TasksScreen() {
  const { state, dispatch } = useApp();

  const [text, setText] = useState('');

  const [testStatus, setTestStatus] = useState('Not tested');

  const addTask = () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    dispatch({
      type: 'ADD_TASK',
      payload: trimmedText,
    });

    setText('');
  };

  //test Supabase connection by inserting a test task - temporary function
  const testSupabaseConnection = async () => {
    console.log('TEST BUTTON CLICKED');

    setTestStatus('Checking Supabase...');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setTestStatus(
          'Supabase responded, but nobody is signed in. ' +
          'Implement sign-in before testing inserts.'
        );
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: `Connection test ${new Date().toISOString()}`,
          completed: false,
          completed_at: null,
        });

      if (error) {
        throw error;
      }

      setTestStatus(
        'SUCCESS: Task inserted into Supabase!'
      );

      console.log('Supabase insert succeeded');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error('Supabase test failed:', error);

      setTestStatus(`FAILED: ${message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Tasks
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Add a new task..."
        value={text}
        onChangeText={setText}
        accessibilityLabel="New task"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={addTask}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          Add Task
        </Text>
      </TouchableOpacity>

      <FlatList
        data={state.tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.task}
            onPress={() =>
              dispatch({
                type: 'TOGGLE_TASK',
                payload: {
                  id: item.id,
                  completedAt: new Date().toISOString(),
                },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Task: ${item.title}`}
          >
            <Text
              style={[
                styles.taskText,
                item.completed && {
                  textDecorationLine:
                    'line-through',
                  opacity: 0.5,
                },
              ]}
            >
              {item.completed ? '✓ ' : '○ '}
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={testSupabaseConnection}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          Test Supabase Connection
        </Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        Test status: {testStatus}
      </Text>
    </View>
  );
}