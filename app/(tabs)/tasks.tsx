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

    if (!text.trim()) {
      return;
    }

    dispatch({
      type: 'ADD_TASK',
      payload: text.trim(),
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
      />

      <TouchableOpacity
        style={styles.button}
        onPress={addTask}
      >
        <Text style={styles.buttonText}>
          Add Task
        </Text>
      </TouchableOpacity>

      <FlatList
        data={state.tasks}
        keyExtractor={item => item.id}

        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.task}
            onPress={() =>
              dispatch({
                type: 'TOGGLE_TASK',
                payload: item.id,
              })
            }
          >

            <Text style={styles.taskText}>

              {item.completed
                ? '✓ '
                : '○ '}

              {item.title}

            </Text>

          </TouchableOpacity>

        )}
      />

    </View>
  );
}