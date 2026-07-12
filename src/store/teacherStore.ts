import { create } from 'zustand'

interface TeacherState {
  currentTeacherId: string | null
  selectedClassId: string | null
  activeAcademicTerm: string
  sidebarCollapsed: boolean
}

interface TeacherActions {
  setSelectedClass: (classId: string | null) => void
  setTeacherId: (id: string | null) => void
  setActiveTerm: (term: string) => void
  toggleSidebar: () => void
  clearSession: () => void
}

type TeacherStore = TeacherState & TeacherActions

const initialState: TeacherState = {
  currentTeacherId: null,
  selectedClassId: null,
  activeAcademicTerm: '2026',
  sidebarCollapsed: false,
}

export const useTeacherStore = create<TeacherStore>()((set) => ({
  ...initialState,

  setSelectedClass: (classId) =>
    set({ selectedClassId: classId }),

  setTeacherId: (id) =>
    set({ currentTeacherId: id }),

  setActiveTerm: (term) =>
    set({ activeAcademicTerm: term }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  clearSession: () =>
    set({ ...initialState, sidebarCollapsed: false }),
}))
