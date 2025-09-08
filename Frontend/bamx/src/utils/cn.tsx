import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

//Una funcion que combina clases de Tailwind CSS y resuelve conflictos entre CSS y Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}