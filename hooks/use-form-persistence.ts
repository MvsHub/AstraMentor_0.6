"use client"

import { useState, useEffect } from "react"

/**
 * Hook para persistir dados de formulário no localStorage
 * @param key Chave única para identificar os dados no localStorage
 * @param initialValue Valor inicial do formulário
 * @returns [value, setValue] - Estado atual e função para atualizar
 */
export function useFormPersistence<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Inicializar o estado com o valor do localStorage ou o valor inicial
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error("Erro ao recuperar dados do formulário:", error)
      return initialValue
    }
  })

  // Atualizar o localStorage quando o valor mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error("Erro ao salvar dados do formulário:", error)
      }
    }
  }, [key, value])

  return [value, setValue]
}

/**
 * Hook para limpar dados persistentes do formulário
 * @param key Chave do localStorage a ser limpa
 */
export function useClearFormPersistence(key: string): () => void {
  return () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error("Erro ao limpar dados do formulário:", error)
      }
    }
  }
}

