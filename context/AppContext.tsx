import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ------------------------------------------
// TYPES
// ------------------------------------------

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

export type UserPreferences = {
  interfaceStyle: 'Minimal' | 'Visual' | 'Text-focused';
  animations: 'Normal' | 'Reduced' | 'Off';
  sound: 'Normal' | 'Minimal' | 'Off';
};

export type AppState = {
  tasks: Task[];
  checkIns: CheckIn[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];
  preferences: UserPreferences;
};

type TaskRow = {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
};

type CheckInRow = {
  id: string;
  mood: number;
  energy: number;
  created_at: string;
};

type FocusSessionRow = {
  id: string;
  duration_minutes: number | string;
  completed_at: string;
};

type JournalEntryRow = {
  id: string;
  text: string;
  created_at: string;
};

type PreferencesRow = {
  interface_style: UserPreferences['interfaceStyle'];
  animations: UserPreferences['animations'];
  sound: UserPreferences['sound'];
};

type Action =
  | { type: 'RESET_STATE' }
  | { type: 'HYDRATE_STATE'; payload: AppState }
  | { type: 'REPLACE_TASKS'; payload: Task[] }
  | { type: 'UPSERT_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'ADD_CHECK_IN'; payload: CheckIn }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> };

type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
  tasksLoading: boolean;
  taskError: string | null;
  dataError: string | null;
  refreshTasks: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  createTask: (title: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addCheckIn: (mood: number, energy: number) => Promise<void>;
  addFocusSession: (durationMinutes: number) => Promise<void>;
  addJournalEntry: (text: string) => Promise<void>;
  savePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
  clearAllData: () => Promise<void>;
};

// ------------------------------------------
// CONFIGURATION AND MAPPING
// ------------------------------------------

// This key was used by the previous local-only prototype. It is not read or
// written for account data anymore because it has no reliable user_id.
const LEGACY_STORAGE_KEY = '@neurodiversity_app_state_v1';

const defaultPreferences: UserPreferences = {
  interfaceStyle: 'Minimal',
  animations: 'Reduced',
  sound: 'Off',
};

const initialState: AppState = {
  tasks: [],
  checkIns: [],
  focusSessions: [],
  journalEntries: [],
  preferences: { ...defaultPreferences },
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function getRequiredUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('You must be signed in to save app data.');
  return user;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    completedAt: row.completed_at,
  };
}

function mapCheckIn(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    mood: row.mood,
    energy: row.energy,
    createdAt: row.created_at,
  };
}

function mapFocusSession(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    durationMinutes: Number(row.duration_minutes),
    completedAt: row.completed_at,
  };
}

function mapJournalEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
  };
}

function mapPreferences(row: PreferencesRow | null): UserPreferences {
  if (!row) return { ...defaultPreferences };
  return {
    interfaceStyle: row.interface_style,
    animations: row.animations,
    sound: row.sound,
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RESET_STATE':
      return {
        ...initialState,
        preferences: { ...defaultPreferences },
      };

    case 'HYDRATE_STATE':
      return action.payload;

    case 'REPLACE_TASKS':
      return { ...state, tasks: action.payload };

    case 'UPSERT_TASK': {
      const exists = state.tasks.some((item) => item.id === action.payload.id);
      return {
        ...state,
        tasks: exists
          ? state.tasks.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [...state.tasks, action.payload],
      };
    }

    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((item) => item.id !== action.payload),
      };

    case 'ADD_CHECK_IN':
      return {
        ...state,
        checkIns: [action.payload, ...state.checkIns],
      };

    case 'ADD_FOCUS_SESSION':
      return {
        ...state,
        focusSessions: [action.payload, ...state.focusSessions],
      };

    case 'ADD_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: [action.payload, ...state.journalEntries],
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    default:
      return state;
  }
}

// ------------------------------------------
// CONTEXT PROVIDER
// ------------------------------------------

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // These refs prevent responses from a previous account from being applied
  // after a sign-out or account switch.
  const requestIdRef = useRef(0);
  const activeUserIdRef = useRef<string | null | undefined>(undefined);
  const loadingUserIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const mountedRef = useRef(true);

  const runDataOperation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      setDataError(null);

      try {
        return await operation();
      } catch (error) {
        if (mountedRef.current) {
          setDataError(getErrorMessage(error));
        }
        throw error;
      }
    },
    []
  );

  const loadUserData = useCallback(async (userId: string, requestId: number) => {
    try {
      const [
        tasksResult,
        checkInsResult,
        focusSessionsResult,
        journalEntriesResult,
        preferencesResult,
      ] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, completed, completed_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        supabase
          .from('check_ins')
          .select('id, mood, energy, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('focus_sessions')
          .select('id, duration_minutes, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false }),
        supabase
          .from('journal_entries')
          .select('id, text, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_preferences')
          .select('interface_style, animations, sound')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      const queryError =
        tasksResult.error ??
        checkInsResult.error ??
        focusSessionsResult.error ??
        journalEntriesResult.error ??
        preferencesResult.error;
      if (queryError) throw queryError;

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current ||
        activeUserIdRef.current !== userId
      ) {
        return;
      }

      dispatch({
        type: 'HYDRATE_STATE',
        payload: {
          tasks: ((tasksResult.data ?? []) as TaskRow[]).map(mapTask),
          checkIns: ((checkInsResult.data ?? []) as CheckInRow[]).map(mapCheckIn),
          focusSessions: ((focusSessionsResult.data ?? []) as FocusSessionRow[]).map(mapFocusSession),
          journalEntries: ((journalEntriesResult.data ?? []) as JournalEntryRow[]).map(mapJournalEntry),
          preferences: mapPreferences(
            (preferencesResult.data as PreferencesRow | null) ?? null
          ),
        },
      });
      setDataError(null);
      setTaskError(null);
    } catch (error) {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current &&
        activeUserIdRef.current === userId
      ) {
        setDataError(getErrorMessage(error));
        // Keep the new account's state empty if any of its data failed to load.
        dispatch({ type: 'RESET_STATE' });
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current &&
        activeUserIdRef.current === userId
      ) {
        loadingUserIdRef.current = null;
        hydratedRef.current = true;
        setIsHydrated(true);
        setTasksLoading(false);
      }
    }
  }, []);

  const startSessionLoad = useCallback((session: Session | null) => {
    const userId = session?.user?.id ?? null;

    // Auth can emit INITIAL_SESSION and getSession can resolve at almost the
    // same time. Avoid starting the same account load twice.
    if (
      activeUserIdRef.current === userId &&
      (hydratedRef.current || loadingUserIdRef.current === userId)
    ) {
      return;
    }

    const requestId = ++requestIdRef.current;
    activeUserIdRef.current = userId;
    dispatch({ type: 'RESET_STATE' });
    setTaskError(null);
    setDataError(null);

    if (!userId) {
      loadingUserIdRef.current = null;
      hydratedRef.current = true;
      setIsHydrated(true);
      setTasksLoading(false);
      return;
    }

    loadingUserIdRef.current = userId;
    hydratedRef.current = false;
    setIsHydrated(false);
    setTasksLoading(true);

    // Avoid issuing Supabase queries inside Supabase's auth callback.
    setTimeout(() => {
      void loadUserData(userId, requestId);
    }, 0);
  }, [loadUserData]);

  useEffect(() => {
    mountedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      startSessionLoad(session);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mountedRef.current) return;
      if (error) {
        startSessionLoad(null);
        setDataError(getErrorMessage(error));
        return;
      }
      startSessionLoad(data.session);
    });

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [startSessionLoad]);

  const refreshAllData = useCallback(async () => {
    const user = await getRequiredUser();
    if (activeUserIdRef.current !== user.id) {
      throw new Error('Your account changed. Please try again.');
    }
    const requestId = ++requestIdRef.current;
    loadingUserIdRef.current = user.id;
    hydratedRef.current = false;
    setIsHydrated(false);
    setTasksLoading(true);
    await loadUserData(user.id, requestId);
  }, [loadUserData]);

  const refreshTasks = useCallback(async () => {
    setTaskError(null);
    setTasksLoading(true);
    let operationUserId: string | null | undefined = activeUserIdRef.current;
    let requestId = requestIdRef.current;
    try {
      const user = await getRequiredUser();
      operationUserId = user.id;
      requestId = requestIdRef.current;
      if (activeUserIdRef.current !== user.id) {
        throw new Error('Your account changed. Please try again.');
      }
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, completed, completed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (
        requestId !== requestIdRef.current ||
        activeUserIdRef.current !== user.id
      ) return;
      dispatch({
        type: 'REPLACE_TASKS',
        payload: ((data ?? []) as TaskRow[]).map(mapTask),
      });
    } catch (error) {
      setTaskError(getErrorMessage(error));
      throw error;
    } finally {
      // A stale request must not turn off a newer account's loading indicator.
      if (
        requestId === requestIdRef.current &&
        activeUserIdRef.current === operationUserId
      ) {
        setTasksLoading(false);
      }
    }
  }, []);

  const createTask = useCallback(async (title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) throw new Error('Task title cannot be empty.');

    setTaskError(null);
    try {
      const user = await getRequiredUser();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: cleanTitle,
          completed: false,
          completed_at: null,
        })
        .select('id, title, completed, completed_at')
        .single();
      if (error) throw error;
      if (activeUserIdRef.current !== user.id) {
        throw new Error('Your account changed while saving the task.');
      }
      dispatch({ type: 'UPSERT_TASK', payload: mapTask(data as TaskRow) });
    } catch (error) {
      setTaskError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const toggleTask = useCallback(async (task: Task) => {
    setTaskError(null);
    try {
      const user = await getRequiredUser();
      const completed = !task.completed;
      const completedAt = completed ? new Date().toISOString() : null;
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed, completed_at: completedAt })
        .eq('id', task.id)
        .eq('user_id', user.id)
        .select('id, title, completed, completed_at')
        .single();
      if (error) throw error;
      if (activeUserIdRef.current !== user.id) {
        throw new Error('Your account changed while updating the task.');
      }
      dispatch({ type: 'UPSERT_TASK', payload: mapTask(data as TaskRow) });
    } catch (error) {
      setTaskError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    setTaskError(null);
    try {
      const user = await getRequiredUser();
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select('id')
        .single();
      if (error) throw error;
      if (!data) throw new Error('The task could not be deleted.');
      if (activeUserIdRef.current !== user.id) {
        throw new Error('Your account changed while deleting the task.');
      }
      dispatch({ type: 'REMOVE_TASK', payload: taskId });
    } catch (error) {
      setTaskError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const addCheckIn = useCallback(
    async (mood: number, energy: number) => {
      await runDataOperation(async () => {
        if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
          throw new Error('Mood must be a whole number from 1 to 5.');
        }

        if (!Number.isInteger(energy) || energy < 1 || energy > 5) {
          throw new Error('Energy must be a whole number from 1 to 5.');
        }

        const user = await getRequiredUser();

        if (activeUserIdRef.current !== user.id) {
          throw new Error('Your account changed. Please try again.');
        }

        const { data, error } = await supabase
          .from('check_ins')
          .insert({
            user_id: user.id,
            mood,
            energy,
          })
          .select('id, mood, energy, created_at')
          .single();

        if (error) throw error;

        if (activeUserIdRef.current !== user.id) {
          throw new Error('Your account changed while saving the check-in.');
        }

        dispatch({
          type: 'ADD_CHECK_IN',
          payload: mapCheckIn(data as CheckInRow),
        });
      });
    },
    [runDataOperation]
  );

  const addFocusSession = useCallback(
    async (durationMinutes: number) => {
      await runDataOperation(async () => {
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          throw new Error('Focus duration must be greater than zero.');
        }
        // Keep the rest of your existing addFocusSession
        // Supabase insert and dispatch logic here.
        const user = await getRequiredUser();
        const { data, error } = await supabase
          .from('focus_sessions')
          .insert({ user_id: user.id, duration_minutes: durationMinutes })
          .select('id, duration_minutes, completed_at')
          .single();
        if (error) throw error;
        if (activeUserIdRef.current !== user.id) {
          throw new Error('Your account changed while saving the focus session.');
        }
        dispatch({
          type: 'ADD_FOCUS_SESSION',
          payload: mapFocusSession(data as FocusSessionRow),
        });
      });
    },
    [runDataOperation]
  );

  const addJournalEntry = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) throw new Error('Journal entry cannot be empty.');
    const user = await getRequiredUser();
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, text: cleanText })
      .select('id, text, created_at')
      .single();
    if (error) throw error;
    if (activeUserIdRef.current !== user.id) {
      throw new Error('Your account changed while saving the journal entry.');
    }
    dispatch({
      type: 'ADD_JOURNAL_ENTRY',
      payload: mapJournalEntry(data as JournalEntryRow),
    });
  }, []);

  const savePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    const user = await getRequiredUser();
    const payload: {
      user_id: string;
      updated_at: string;
      interface_style?: UserPreferences['interfaceStyle'];
      animations?: UserPreferences['animations'];
      sound?: UserPreferences['sound'];
    } = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (patch.interfaceStyle !== undefined) payload.interface_style = patch.interfaceStyle;
    if (patch.animations !== undefined) payload.animations = patch.animations;
    if (patch.sound !== undefined) payload.sound = patch.sound;
    if (Object.keys(patch).length === 0) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
    if (activeUserIdRef.current !== user.id) {
      throw new Error('Your account changed while saving preferences.');
    }
    dispatch({ type: 'SET_PREFERENCES', payload: patch });
  }, []);

  const clearAllData = useCallback(async () => {
    const user = await getRequiredUser();
    if (activeUserIdRef.current !== user.id) {
      throw new Error('Your account changed. Please try again.');
    }

    try {
      // Every delete is scoped to the signed-in user's id in addition to RLS.
      const results = await Promise.all([
        supabase.from('tasks').delete().eq('user_id', user.id),
        supabase.from('check_ins').delete().eq('user_id', user.id),
        supabase.from('focus_sessions').delete().eq('user_id', user.id),
        supabase.from('journal_entries').delete().eq('user_id', user.id),
        supabase.from('user_preferences').delete().eq('user_id', user.id),
      ]);
      const failed = results.find((result) => result.error)?.error;
      if (failed) throw failed;
      if (activeUserIdRef.current !== user.id) {
        throw new Error('Your account changed while clearing data.');
      }

      // Remove the unused key from the former local-only prototype as well.
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch((storageError) => {
        // Cloud data has already been cleared; a legacy local-key cleanup
        // problem should not turn a successful cloud reset into a false failure.
        console.warn('Could not remove legacy local app data:', storageError);
      });
      dispatch({ type: 'RESET_STATE' });
      setDataError(null);
      setTaskError(null);
    } catch (error) {
      // Some cloud deletes may already have succeeded; reload server state so
      // the UI reflects what actually remains if the operation partially fails.
      try {
        await refreshAllData();
      } catch {
        // The original error is more useful to the screen initiating the reset.
      }
      throw error;
    }
  }, [refreshAllData]);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F9FBFF',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isHydrated,
        tasksLoading,
        taskError,
        dataError,
        refreshTasks,
        refreshAllData,
        createTask,
        toggleTask,
        deleteTask,
        addCheckIn,
        addFocusSession,
        addJournalEntry,
        savePreferences,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}