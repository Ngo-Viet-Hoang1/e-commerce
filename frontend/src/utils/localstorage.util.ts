export const storage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key)
  },

  getJSONItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },

  setJSONItem: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}
