import { DomainError } from '../../../shared/DomainError';

// Interfaz que define la estructura del candidato
export interface Candidate {
  id: number;
  name: string;
  email: string;
  city: string;
  experienceYears: number;
}

// Tipo para un nuevo candidato (sin id)
export type NewCandidate = Omit<Candidate, 'id'>;

// Expresión regular estándar para validar formato de correo electrónico
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Función flecha para validar y limpiar los datos de entrada
export const parseNewCandidate = (input: unknown): NewCandidate => {
  const { name, email, city, experienceYears } = (input ?? {}) as Record<string, unknown>;

  // Regla 1: name y email son obligatorios
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !email.trim()
  ) {
    throw new DomainError('El nombre y el correo son obligatorios');
  }

  // Regla 2: email con formato válido
  if (!EMAIL_REGEX.test(email.trim())) {
    throw new DomainError('El correo no tiene un formato válido');
  }

  // Regla 3: city es obligatoria
  if (typeof city !== 'string' || !city.trim()) {
    throw new DomainError('La ciudad es obligatoria');
  }

  // Regla 4: experienceYears es un número mayor o igual que 0
  if (typeof experienceYears !== 'number' || Number.isNaN(experienceYears) || experienceYears < 0) {
    throw new DomainError('Los años de experiencia deben ser un número igual o mayor que 0');
  }

  // Retorna datos limpios
  return {
    name: name.trim(),
    email: email.trim(),
    city: city.trim(),
    experienceYears,
  };
};
