import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { services } from './index'

const ServicesContext = createContext<typeof services | null>(null)

export interface ServicesProviderProps {
  children: ReactNode
  value?: typeof services
}

export function ServicesProvider({ children, value = services }: ServicesProviderProps) {
  return React.createElement(ServicesContext.Provider, { value }, children)
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}
