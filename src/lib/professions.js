// src/lib/professions.js
// ─────────────────────────────────────────────────────────────
// The single source of truth for the profession list. Several files
// have been importing PROFESSIONS from "../lib/mockBackend" — that
// was a leftover from an earlier mock-data phase of this build and
// should be considered deprecated. Point everything at this file
// instead (provider_register.jsx, request_modal.jsx, application
// page, etc.) so "plumber", "electrician" etc. are spelled and IDed
// identically everywhere a profession is picked or displayed.
// ─────────────────────────────────────────────────────────────
export const PROFESSIONS = [
  { id: 'electrician',       name: 'Electrician',          icon: '⚡', category: 'Home Repair' },
  { id: 'plumber',           name: 'Plumber',               icon: '💧', category: 'Home Repair' },
  { id: 'painter',           name: 'Painter',                icon: '🎨', category: 'Home Repair' },
  { id: 'carpenter',         name: 'Carpenter',              icon: '🪚', category: 'Home Repair' },
  { id: 'mechanic',          name: 'Mechanic',               icon: '🔧', category: 'Automotive' },
  { id: 'ac_technician',     name: 'AC Technician',          icon: '❄️', category: 'Home Repair' },
  { id: 'cleaner',           name: 'Cleaner',                icon: '🏠', category: 'Home Services' },
  { id: 'barber',            name: 'Barber',                 icon: '💈', category: 'Personal Care' },
  { id: 'hair_stylist',      name: 'Hair Stylist',           icon: '💇', category: 'Personal Care' },
  { id: 'makeup_artist',     name: 'Makeup Artist',          icon: '💄', category: 'Personal Care' },
  { id: 'welder',            name: 'Welder',                 icon: '🔥', category: 'Construction' },
  { id: 'mason',             name: 'Mason',                  icon: '🧱', category: 'Construction' },
  { id: 'pop_installer',     name: 'POP Installer',          icon: '🏗️', category: 'Construction' },
  { id: 'cctv_installer',    name: 'CCTV Installer',         icon: '📹', category: 'Technology' },
  { id: 'roofer',            name: 'Roofer',                 icon: '🏚️', category: 'Construction' },
  { id: 'solar_installer',   name: 'Solar Installer',        icon: '☀️', category: 'Technology' },
  { id: 'interior_designer', name: 'Interior Designer',      icon: '🛋️', category: 'Design' },
  { id: 'furniture_maker',   name: 'Furniture Maker',        icon: '🪑', category: 'Construction' },
  { id: 'generator_tech',    name: 'Generator Technician',   icon: '🔌', category: 'Technology' },
  { id: 'computer_tech',     name: 'Computer Technician',    icon: '💻', category: 'Technology' },
]