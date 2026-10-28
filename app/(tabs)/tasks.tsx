import React, { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    useApp,
    type Task,
} from '../../context/AppContext';

import { styles } from '../../styles/tabs';

export default function TasksScreen() {
  const {
    state,
    tasksLoading,
    taskError,
    refreshTasks,
    createTask,
    toggleTask,
    deleteTask,
  } = useApp();

  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] =
    useState<string | null>(null);

  // ----------------------------------------
  // ADD TASK
  // ----------------------------------------

  const handleAddTask = async () => {
    const title = text.trim();

    if (!title || saving) {
      return;
    }

    setSaving(true);

    try {
      await createTask(title);
      setText('');
    } catch {
      // AppContext exposes the error through taskError.
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // COMPLETE / UNCOMPLETE TASK
  // ----------------------------------------

  const handleToggleTask = async (task: Task) => {
    if (busyTaskId !== null) {
      return;
    }

    setBusyTaskId(task.id);

    try {
      await toggleTask(task);
    } catch {
      // The shared state only changes if the
      // database update succeeds.
    } finally {
      setBusyTaskId(null);
    }
  };

  // ----------------------------------------
  // DELETE TASK
  // ----------------------------------------

  const performDelete = async (taskId: string) => {
    if (busyTaskId !== null) {
      return;
    }

    setBusyTaskId(taskId);

    try {
      await deleteTask(taskId);
    } catch {
      // Error will be shown below the controls.
    } finally {
      setBusyTaskId(null);
    }
  };

  const confirmDelete = (taskId: string) => {
    const title = 'Delete this task?';
    const message =
      'This task will be permanently removed from your account.';

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(`${title}\n\n${message}`)
      ) {
        void performDelete(taskId);
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void performDelete(taskId);
        },
      },
    ]);
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Tasks
      </Text>

      <Text style={styles.text}>
        Your tasks sync with your Supabase account.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Add a new task..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => {
          void handleAddTask();
        }}
        returnKeyType="done"
        accessibilityLabel="New task title"
      />

      <TouchableOpacity
        style={[
          styles.button,
          (saving || !text.trim()) && {
            opacity: 0.6,
          },
        ]}
        onPress={() => {
          void handleAddTask();
        }}
        disabled={saving || !text.trim()}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Add Task'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          void refreshTasks().catch(() => {});
        }}
        disabled={tasksLoading}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>
          {tasksLoading
            ? 'Refreshing...'
            : 'Refresh from Cloud'}
        </Text>
      </TouchableOpacity>

      {taskError !== null && (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderRadius: 10,
            padding: 12,
            marginVertical: 8,
          }}
        >
          <Text
            style={{
              color: '#B42318',
              fontSize: 14,
              lineHeight: 21,
            }}
          >
            {taskError}
          </Text>
        </View>
      )}

      <Text style={styles.subheading}>
        Your Tasks ({state.tasks.length})
      </Text>

      {tasksLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />

          <Text style={styles.text}>
            Loading tasks from Supabase...
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={state.tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <Text style={styles.text}>
              No tasks yet. Add your first task above.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.task}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                  }}
                  onPress={() => {
                    void handleToggleTask(item);
                  }}
                  disabled={busyTaskId !== null}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: item.completed,
                    disabled: busyTaskId !== null,
                  }}
                  accessibilityLabel={item.title}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && {
                        textDecorationLine:
                          'line-through',
                        opacity: 0.55,
                      },
                    ]}
                  >
                    {item.completed ? '✓ ' : '○ '}
                    {item.title}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    confirmDelete(item.id);
                  }}
                  disabled={busyTaskId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `Delete task: ${item.title}`
                  }
                  style={{
                    padding: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#B42318',
                      fontWeight: '600',
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>

              {busyTaskId === item.id && (
                <Text style={styles.text}>
                  Saving changes...
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}