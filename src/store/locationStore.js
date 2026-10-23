import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const EMPTY_LOCATION = {
  latitude: null,
  longitude: null,
  accuracy: null,
  address: null,
  city: null,
  state: null,
  country: null,
  postcode: null,
}

export const useLocationStore = create(
  persist(
    (set) => ({
      location: EMPTY_LOCATION,
      permissionStatus: 'unset',

      setLocation: (data) =>
        set({
          location: {
            latitude:
              data?.coords?.latitude ??
              data?.latitude ??
              null,

            longitude:
              data?.coords?.longitude ??
              data?.longitude ??
              null,

            accuracy:
              data?.coords?.accuracy ??
              data?.accuracy ??
              null,

            address:
              data?.address ??
              data?.label ??
              null,

            city: data?.city ?? null,
            state: data?.state ?? null,
            country: data?.country ?? null,
            postcode: data?.postcode ?? null,
          },

          permissionStatus:
            data?.permissionStatus ?? 'manual',
        }),

      setCoords: (coords) =>
        set((current) => ({
          location: {
            ...current.location,

            latitude:
              coords?.latitude ??
              current.location.latitude ??
              null,

            longitude:
              coords?.longitude ??
              current.location.longitude ??
              null,

            accuracy:
              coords?.accuracy ??
              current.location.accuracy ??
              null,
          },
        })),

      setAddress: (address) =>
        set((current) => ({
          location: {
            ...current.location,
            ...address,
          },
        })),

      setPermissionStatus: (permissionStatus) =>
        set({
          permissionStatus,
        }),

      clearLocation: () =>
        set({
          location: EMPTY_LOCATION,
          permissionStatus: 'unset',
        }),
    }),
    {
      name: 'surepro-location',
    }
  )
)