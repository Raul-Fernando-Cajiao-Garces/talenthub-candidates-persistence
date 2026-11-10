import { NewVacancy, Vacancy } from '../domain/Vacancy';

// Contrato que debe cumplir CUALQUIER lugar donde se guarden vacantes.
export interface VacancyRepository {
  // Devuelve todas las vacantes.
  findAll: () => Promise<Vacancy[]>;

  // Busca una vacante por su id. "Vacancy | undefined" = o devuelve la vacante, o nada (undefined).
  findById: (id: number) => Promise<Vacancy | undefined>;

  // Guarda una vacante nueva (sin id) y devuelve la vacante ya con su id.
  save: (newVacancy: NewVacancy) => Promise<Vacancy>;

  // Reemplaza los datos de una vacante existente. Devuelve la vacante actualizada, o undefined si no existe.
  update: (id: number, data: NewVacancy) => Promise<Vacancy | undefined>;

  // Elimina una vacante. Devuelve true si la eliminó, o false si no existía.
  remove: (id: number) => Promise<boolean>;
}
