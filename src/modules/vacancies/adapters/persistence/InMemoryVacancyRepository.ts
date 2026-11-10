import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

// Adaptador de salida: cumple el contrato VacancyRepository guardando las vacantes en un arreglo.
export class InMemoryVacancyRepository implements VacancyRepository {
  // La lista donde se guardan las vacantes. "private" = solo esta clase puede tocarla.
  private vacancies: Vacancy[];

  // El número que usará la próxima vacante. Solo sube, así que un id eliminado nunca se reutiliza.
  private nextId: number;

  constructor(initialVacancies: Vacancy[] = []) {
    // Se copia la lista para no depender del arreglo original.
    this.vacancies = [...initialVacancies];
    this.nextId = initialVacancies.length + 1;
  }

  // Devuelve una COPIA de la lista, para que nadie de afuera pueda modificar la original.
  findAll = async (): Promise<Vacancy[]> => [...this.vacancies];

  // Busca una vacante por id.
  findById = async (id: number): Promise<Vacancy | undefined> => {
    // "find" recorre la lista y devuelve el primer elemento que cumpla la condición (o undefined).
    const vacancy = this.vacancies.find((item) => item.id === id);

    // Si existe devuelve una copia; si no, undefined.
    return vacancy ? { ...vacancy } : undefined;
  };

  // Guarda una vacante nueva.
  save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
    const vacancy: Vacancy = { id: this.nextId++, ...newVacancy };
    this.vacancies.push(vacancy);
    return vacancy;
  };

  // Reemplaza los datos de una vacante existente.
  update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
    // "findIndex" devuelve la posición del elemento en la lista, o -1 si no lo encuentra.
    const index = this.vacancies.findIndex((item) => item.id === id);

    // Si no existe, informa con undefined (el servicio decidirá qué significa).
    if (index === -1) {
      return undefined;
    }

    // Arma la vacante actualizada conservando el mismo id.
    const updated: Vacancy = { id, ...data };

    // Reemplaza el elemento en esa posición.
    this.vacancies[index] = updated;
    return { ...updated };
  };

  // Elimina una vacante.
  remove = async (id: number): Promise<boolean> => {
    const index = this.vacancies.findIndex((item) => item.id === id);

    // Si no existe, avisa con false.
    if (index === -1) {
      return false;
    }

    // "splice(posición, 1)" quita 1 elemento de la lista en esa posición.
    this.vacancies.splice(index, 1);
    return true;
  };
}
