import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            toggleTheme: () =>
                set((state) => {
                    const newDark = !state.isDark
                    if (newDark) {
                        document.documentElement.classList.add('dark')
                    } else {
                        document.documentElement.classList.remove('dark')
                    }
                    return { isDark: newDark }
                }),
            initTheme: () =>
                set((state) => {
                    if (state.isDark) {
                        document.documentElement.classList.add('dark')
                    }
                    return state
                }),
        }),
        { name: 'rozi-theme' }
    )
)

export default useThemeStore