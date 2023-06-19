import { useLazyQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  ReactNode,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import uuid from "react-native-uuid";
import { useAsyncStorage } from "../hooks";
import { GET_SETS_ON_EXERCISE } from "../services/set-on-exercise.service";
import { Exercise, ExerciseSet } from "../types";

export const SetContext = createContext<{
  sets: ExerciseSet[];
  loading: boolean;
  error: Error | null;
  setSets: (sets: ExerciseSet[]) => void;
  fetchSetData: () => Promise<ExerciseSet[]>;
  addSet: (set: ExerciseSet) => void;
  removeSet: (setId: string) => void;
  updateSet: (index: number, newSet: ExerciseSet) => void;
}>({
  sets: [],
  loading: false,
  error: null,
  setSets: () => {},
  fetchSetData: () => Promise.resolve([] as ExerciseSet[]),
  addSet: () => {},
  removeSet: () => {},
  updateSet: () => {},
});

interface Props {
  children: ReactNode;
  exercise: Exercise;
  sessionId: string;
}

// Provider for the SetContext.
const SetProvider = ({ children, sessionId, exercise }: Props) => {
  const isMountedRef = useRef(false);
  const key = `@TrainerAI:Session:${sessionId}Exercise${exercise.id}:Sets${exercise.uuid}`;
  const [sets, setSets] = useAsyncStorage(key, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const variables = { exerciseId: exercise.id };
  const [getSets] = useLazyQuery<{ setsOnExercise: ExerciseSet[] }>(
    GET_SETS_ON_EXERCISE,
    { variables },
  );

  // Ensure that the component is mounted before performing certain operations.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper function to perform a safe state update.
  const safeUpdate = (updateFunc: Function) => (...args: any[]) => {
    if (isMountedRef.current) {
      updateFunc(...args);
    }
  };

  const addSet = safeUpdate((set: ExerciseSet) => {
    setSets([...sets, set]);
  });

  const removeSet = safeUpdate((setId: string) => {
    setSets((prevSets: ExerciseSet[]) =>
      prevSets.filter(set => set.id !== setId),
    );
  });

  const updateSet = safeUpdate((index: number, newSet: ExerciseSet) => {
    const newSets = [...sets];
    newSets[index] = newSet;
    setSets(newSets);
  });

  // Fetches set data from storage or network.
  const fetchSetData = async (): Promise<ExerciseSet[]> => {
    setError(null);
    setLoading(true);
    try {
      const storedSets = await AsyncStorage.getItem(key);
      const networkSets = storedSets
        ? JSON.parse(storedSets)
        : (await getSets()).data?.setsOnExercise;
      const setsWithIds = networkSets.map((set: ExerciseSet) => ({
        ...set,
        id: uuid.v4(),
      }));
      safeUpdate(setSets)(setsWithIds ?? []);
      setLoading(false);
      return setsWithIds ?? [];
    } catch (err) {
      if (err instanceof Error) {
        safeUpdate(setError)(err);
      }
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    fetchSetData();
  }, [exercise]);

  return (
    <SetContext.Provider
      value={{
        sets,
        error,
        loading,
        setSets,
        fetchSetData,
        addSet,
        removeSet,
        updateSet,
      }}>
      {children}
    </SetContext.Provider>
  );
};

export default SetProvider;
