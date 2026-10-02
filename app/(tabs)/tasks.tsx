import React, { useState } from 'react';

import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useApp } from '../context/AppContext';

import { styles } from './styles';

export default function TasksScreen() {
  const { state, dispatch } = useApp();

  const [text, setText] = useState('');

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
                payload: item.id,
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
    </View>
  );
}