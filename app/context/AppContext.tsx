import React, {
  createContext,
  ReactNode,
  useContext,
  useReducer,
} from 'react';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
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
    interfaceStyle: 'Minimal' | 'Visual' | 'Text-focused';
    animations: 'Normal' | 'Reduced' | 'Off';
    sound: 'Normal' | 'Minimal' | 'Off';
  };
};

type Action =
  | {
      type: 'ADD_TASK';
      payload: string;
    }
  | {
      type: 'TOGGLE_TASK';
      payload: string;
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
    };

const initialState: AppState = {
  tasks: [
    {
      id: '1',
      title: 'Finish project proposal',
      completed: false,
    },
    {
      id: '2',
      title: 'Reply to emails',
      completed: false,
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
          },
        ],
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                completed: !task.completed,
              }
            : task
        ),
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
            createdAt: new Date().toISOString(),
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
            durationMinutes: action.payload,
            completedAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case 'SET_INTERFACE_STYLE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          interfaceStyle: action.payload,
        },
      };

    case 'SET_ANIMATIONS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          animations: action.payload,
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

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    appReducer,
    initialState
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside AppProvider'
    );
  }

  return context;
}