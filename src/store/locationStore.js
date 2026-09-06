import { create } from 'zustand'

// permissionStatus: 'unset' | 'granted' | 'denied' | 'manual'
export const useLocationStore = create((set) => ({
  coords: null, // { latitude, longitude }
  label: null, // human-readable place name
  permissionStatus: 'unset',

  setCoords: (coords) => set({ coords }),
  setLabel: (label) => set({ label }),
  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),

  setLocation: ({ coords, label, permissionStatus }) =>
    set({
      coords: coords ?? null,
      label: label ?? null,
      permissionStatus: permissionStatus ?? 'manual',
    }),
}))