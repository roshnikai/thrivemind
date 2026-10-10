import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
};

export type CheckIn = {
  id: string;
  mood: number;
  energy: number;
  createdAt: string;
};

export type FocusSession = {
  id: string;
  durationMinutes: number;
  completedAt: string;
};

export type JournalEntry = {
  id: string;
  text: string;
  createdAt: string;
};

export type AppState = {
  tasks: Task[];
  checkIns: CheckIn[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];

  preferences: {
    interfaceStyle:
      | 'Minimal'
      | 'Visual'
      | 'Text-focused';

    animations:
      | 'Normal'
      | 'Reduced'
      | 'Off';

    sound:
      | 'Normal'
      | 'Minimal'
      | 'Off';
  };
};

type Action =
  | {
      type: 'ADD_TASK';
      payload: string;
    }
  | {
      type: 'TOGGLE_TASK';
      payload: {
        id: string;
        completedAt: string;
      };
    }
  | {
      type: 'ADD_CHECK_IN';
      payload: {
        mood: number;
        energy: number;
      };
    }
  | {
      type: 'ADD_FOCUS_SESSION';
      payload: number;
    }
  | {
      type: 'ADD_JOURNAL_ENTRY';
      payload: string;
    }
  | {
      type: 'SET_INTERFACE_STYLE';
      payload: 'Minimal' | 'Visual' | 'Text-focused';
    }
  | {
      type: 'SET_ANIMATIONS';
      payload: 'Normal' | 'Reduced' | 'Off';
    }
  | {
      type: 'SET_SOUND';
      payload: 'Normal' | 'Minimal' | 'Off';
    }
  | {
      type: 'CLEAR_ALL_DATA';
    }
  | {
      type: 'HYDRATE_STATE';
      payload: AppState;
    };

const initialState: AppState = {
  tasks: [
    {
      id: '1',
      title: 'Finish project proposal',
      completed: false,
      completedAt: null,
    },
    {
      id: '2',
      title: 'Reply to emails',
      completed: false,
      completedAt: null,
    },
  ],

  checkIns: [],

  focusSessions: [],

  journalEntries: [],

  preferences: {
    interfaceStyle: 'Minimal',
    animations: 'Reduced',
    sound: 'Off',
  },
};

function appReducer(
  state: AppState,
  action: Action
): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: Date.now().toString(),
            title: action.payload,
            completed: false,
            completedAt: null,
          },
        ],
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.payload.id) {
            return task;
          }

          const completed = !task.completed;

          return {
            ...task,
            completed,
            completedAt: completed
              ? action.payload.completedAt
              : null,
          };
        }),
      };

    case 'ADD_CHECK_IN':
      return {
        ...state,
        checkIns: [
          ...state.checkIns,
          {
            id: Date.now().toString(),
            mood: action.payload.mood,
            energy: action.payload.energy,
            createdAt:
              new Date().toISOString(),
          },
        ],
      };

    case 'ADD_FOCUS_SESSION':
      return {
        ...state,
        focusSessions: [
          ...state.focusSessions,
          {
            id: Date.now().toString(),
            durationMinutes:
              action.payload,
            completedAt:
              new Date().toISOString(),
          },
        ],
      };

    case 'ADD_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: [
          ...state.journalEntries,
          {
            id: Date.now().toString(),
            text: action.payload,
            createdAt:
              new Date().toISOString(),
          },
        ],
      };

    case 'SET_INTERFACE_STYLE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          interfaceStyle:
            action.payload,
        },
      };

    case 'SET_ANIMATIONS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          animations:
            action.payload,
        },
      };

    case 'SET_SOUND':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          sound: action.payload,
        },
      };

    case 'CLEAR_ALL_DATA':
      return {
        tasks: [],
        checkIns: [],
        focusSessions: [],
        journalEntries: [],
        preferences: {
          ...initialState.preferences,
        },
      };

    case 'HYDRATE_STATE':
      return action.payload;

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
} | null>(null);

const STORAGE_KEY =
  '@neurodiversity_app_state_v1';

const STORAGE_VERSION = 1;

type PersistedData = {
  version: number;
  state: AppState;
};

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] =
    useReducer(
      appReducer,
      initialState
    );

  const [isHydrated, setIsHydrated] =
    useState(false);

  // ------------------------------------
  // LOAD SAVED STATE WHEN APP STARTS
  // ------------------------------------

  useEffect(() => {
    const loadState = async () => {
      try {
        const storedData =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (storedData !== null) {
          const parsedData =
            JSON.parse(
              storedData
            ) as PersistedData;

          if (
            parsedData.version ===
              STORAGE_VERSION &&
            parsedData.state
          ) {
            const savedState = parsedData.state;

            const hydratedState: AppState = {
              ...initialState,
              ...savedState,

              tasks: (
                savedState.tasks ?? initialState.tasks
              ).map((task) => ({
                ...task,
                completedAt: task.completedAt ?? null,
              })),

              checkIns: savedState.checkIns ?? [],
              focusSessions: savedState.focusSessions ?? [],
              journalEntries: savedState.journalEntries ?? [],

              preferences: {
                ...initialState.preferences,
                ...savedState.preferences,
              },
            };

            dispatch({
              type: 'HYDRATE_STATE',
              payload: hydratedState,
            });
          }
        }
      } catch (error) {
        console.error(
          'Failed to load app state:',
          error
        );
      } finally {
        setIsHydrated(true);
      }
    };

    loadState();
  }, []);

  // ------------------------------------
  // SAVE STATE WHENEVER IT CHANGES
  // ------------------------------------

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveState = async () => {
      try {
        const dataToStore: PersistedData = {
          version: STORAGE_VERSION,
          state,
        };

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(dataToStore)
        );
      } catch (error) {
        console.error(
          'Failed to save app state:',
          error
        );
      }
    };

    saveState();
  }, [state, isHydrated]);

  // ------------------------------------
  // WAIT UNTIL SAVED STATE IS LOADED
  // ------------------------------------

  if (!isHydrated) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isHydrated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside AppProvider'
    );
  }

  return context;
}