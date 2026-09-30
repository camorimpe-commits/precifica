import { useEffect, useState } from 'react'

/** useState que persiste no localStorage (ignora erros de navegador privado/cheio). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e)
    }
  }, [key, value])

  return [value, setValue]
}
