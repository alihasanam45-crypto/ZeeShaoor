import { create } from 'zustand'

interface StudentState {
  studentId: string | null
  activeSubjectId: string | null
  currentStreak: number
  isFocusModeActive: boolean
}

interface StudentActions {
  setStudentId: (id: string | null) => void
  setActiveSubject: (subjectId: string | null) => void
  setCurrentStreak: (streak: number) => void
  toggleFocusMode: () => void
  clearSession: () => void
}

type StudentStore = StudentState & StudentActions

const initialState: StudentState = {
  studentId: null,
  activeSubjectId: null,
  currentStreak: 0,
  isFocusModeActive: false,
}

export const useStudentStore = create<StudentStore>()((set) => ({
  ...initialState,

  setStudentId: (id) =>
    set({ studentId: id }),

  setActiveSubject: (subjectId) =>
    set({ activeSubjectId: subjectId }),

  setCurrentStreak: (streak) =>
    set({ currentStreak: streak }),

  toggleFocusMode: () =>
    set((state) => ({ isFocusModeActive: !state.isFocusModeActive })),

  clearSession: () =>
    set({ ...initialState }),
}))
