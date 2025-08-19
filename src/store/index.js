import {create} from 'zustand'
import {devtools, persist} from "zustand/middleware";
import i18n from './../services/i18n';


let store = (set) => ({
    user: null,
    setUser: (user) => set(state => ({...state, user}))
})

let settingsStore = (set) => ({
    token: null,
    darkMode: false,
    collapsed:false,
    lang: i18n.language,
    setToken: (token) => set(state => ({...state, token})),
    setLang: (lang) => {
        i18n.changeLanguage(lang)
        set(state => ({...state, lang}))
    },
    toggleDarkMode: () => set(state => ({...state, darkMode: !state.darkMode})),
    toggleCollapsed: () => set(state => ({...state, collapsed: !state.collapsed})),
})


store = devtools(store);
settingsStore = devtools(settingsStore)
settingsStore = persist(settingsStore, {name: 'settings'});

export const useStore = create(store)
export const useSettingsStore = create(settingsStore)

