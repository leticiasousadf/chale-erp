'use client'
import*as React from'react'
import{ThemeProvider as NextThemesProvider,type ThemeProviderProps}from'next-themes'
export function ThemeProvider({children,...props}:Omit<ThemeProviderProps,'attribute'>&{attribute?:string}){
  return<NextThemesProvider {...(props as ThemeProviderProps)}>{children}</NextThemesProvider>
}
