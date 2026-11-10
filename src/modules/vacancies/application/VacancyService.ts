// Error que se lanza cuando el recurso pedido no existe. El manejador de errores lo convertirá en 404.
import { NotFoundError } from '../../../shared/NotFoundError';

// Del dominio: la regla de validación y el tipo Vacancy.
import { parseNewVacancy, Vacancy } from '../domain/Vacancy';

// El contrato (puerto). El servicio solo conoce el contrato, no dónde se guardan realmente los datos.
import { VacancyRepository } from '../ports/VacancyRepository';

// Mensaje para el usuario (en español). Se define una vez para no repetirlo.
const VACANCY_NOT_FOUND_MESSAGE = 'Vacante no encontrada';

// Un "servicio" agrupa los casos de uso relacionados con vacantes.
export class VancacyService {
  // Recibe el repositorio desde afuera (inyección de dependencias).
  constructor(private readonly repository: VacancyRepository) {}

  // CASO DE USO 1: listar todas las vacantes.
  list = async (): Promise<Vacancy[]> => this.repository.findAll();

  // CASO DE USO 2: obtener una vacante por su id.
  getById = async (id: number): Promise<Vacancy> => {
    // Pide la vacante al repositorio (puede devolver undefined si no existe).
    const vacancy = await this.repository.findById(id);

    // Si no existe, es un error del negocio: se lanza NotFoundError (→ 404).
    if (!vacancy) {
      throw new NotFoundError(VACANCY_NOT_FOUND_MESSAGE);
    }

    return vacancy;
  };

  // CASO DE USO 3: crear una vacante.
  create = async (input: unknown): Promise<Vacancy> => {
    // El dominio valida. Si hay un error, lanza DomainError y aquí se detiene.
    const newVacancy = parseNewVacancy(input);

    // Si todo está bien, se guarda y se devuelve con su id.
    return this.repository.save(newVacancy);
  };

  // CASO DE USO 4: editar una vacante existente.
  update = async (id: number, input: unknown): Promise<Vacancy> => {
    // 1) Primero se validan los datos nuevos (con las mismas reglas que al crear).
    const data = parseNewVacancy(input);

    // 2) Luego se le pide al repositorio que actualice.
    const updated = await this.repository.update(id, data);

    // 3) Si no existía ninguna vacante con ese id, es un 404.
    if (!updated) {
      throw new NotFoundError(VACANCY_NOT_FOUND_MESSAGE);
    }

    return updated;
  };

  // CASO DE USO 5: eliminar una vacante.
  remove = async (id: number): Promise<void> => {
    // El repositorio devuelve true si eliminó algo, o false si no existía.
    const removed = await this.repository.remove(id);

    if (!removed) {
      throw new NotFoundError(VACANCY_NOT_FOUND_MESSAGE);
    }
  };
}
