// Importa los dos errores que esperamos que se lancen en distintos casos.
import { DomainError } from '../../../shared/DomainError';
import { NotFoundError } from '../../../shared/NotFoundError';

import { InMemoryVacancyRepository } from '../adapters/persistence/InMemoryVacancyRepository';

import { VancacyService } from './VacancyService';

// Datos de ejemplo válidos que se reutilizan en las pruebas
const validInput = { title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 };

// Función auxiliar: crea un servicio nuevo con un repositorio vacío, para que cada prueba parta de cero.
const createService = (): VancacyService => new VancacyService(new InMemoryVacancyRepository());

// "describe" agrupa las pruebas del servicio bajo un mismo título.
describe('VacancyService', () => {
  // "it" es UNA prueba. Esta verifica que crear una vacante válida funciona.
  it('creates a valid vacancy and returns it with an id', async () => {
    // Prepara: un servicio nuevo.
    const service = createService();

    // Actúa: crea una vacante con datos válidos ("await" espera la respuesta).
    const created = await service.create(validInput);

    // Verifica: la primera vacante debe tener id 1 y conservar sus datos.
    expect(created).toEqual({ id: 1, ...validInput });
  });

  // Esta prueba verifica que los datos inválidos se rechazan y no se guardan.
  it('rejects an invalid vacancy and does not save it', async () => {
    // Prepara: un servicio nuevo.
    const service = createService();

    // Verifica: crear sin título debe fallar con un DomainError ("rejects" = la promesa es rechazada).
    await expect(service.create({ company: 'Tech Andes' })).rejects.toThrow(DomainError);

    // Verifica: la lista debe seguir vacía, porque no se guardó nada.
    expect(await service.list()).toEqual([]);
  });

  // Esta prueba verifica que listar devuelve lo que se creó.
  it('lists the vacancies that were created', async () => {
    // Prepara: un servicio nuevo.
    const service = createService();

    // Actúa: crea una vacante válida.
    await service.create(validInput);

    // Verifica: la lista debe tener exactamente una vacante.
    expect(await service.list()).toHaveLength(1);
  });

  // Esta prueba verifica "getById" en sus dos caminos: existe y no existe.
  it('gets a vacancy by id and throws NotFoundError when it does not exist', async () => {
    // Prepara: un servicio y una vacante ya creada.
    const service = createService();
    const created = await service.create(validInput);

    // Verifica: buscar por su id devuelve la misma vacante.
    expect(await service.getById(created.id)).toEqual(created);

    // Verifica: buscar un id que no existe lanza NotFoundError.
    await expect(service.getById(999)).rejects.toThrow(NotFoundError);
  });

  // Esta prueba verifica que se puede editar una vacante con datos válidos.
  it('updates a vacancy with valid data', async () => {
    // Prepara: un servicio y una vacante ya creada.
    const service = createService();
    const created = await service.create(validInput);

    // Actúa: la edita cambiando solo el salario ("...validInput" copia el resto de los datos).
    const updated = await service.update(created.id, { ...validInput, salary: 1200 });

    // Verifica: conserva el mismo id y trae el salario nuevo.
    expect(updated).toEqual({ id: created.id, ...validInput, salary: 1200 });
  });

  // Esta prueba verifica los dos errores posibles al editar.
  it('rejects an update with invalid data and throws NotFoundError for a missing id', async () => {
    // Prepara: un servicio y una vacante ya creada.
    const service = createService();
    const created = await service.create(validInput);

    // Verifica: editar con el título vacío lanza DomainError (datos inválidos → 400).
    await expect(service.update(created.id, { ...validInput, title: '' })).rejects.toThrow(DomainError);

    // Verifica: editar un id que no existe lanza NotFoundError (→ 404).
    await expect(service.update(999, validInput)).rejects.toThrow(NotFoundError);
  });

  // Esta prueba verifica que eliminar funciona y que eliminar dos veces falla.
  it('removes a vacancy and throws NotFoundError when it does not exist', async () => {
    // Prepara: un servicio y una vacante ya creada.
    const service = createService();
    const created = await service.create(validInput);

    // Actúa: la elimina.
    await service.remove(created.id);

    // Verifica: la lista queda vacía.
    expect(await service.list()).toEqual([]);

    // Verifica: eliminarla otra vez lanza NotFoundError, porque ya no existe.
    await expect(service.remove(created.id)).rejects.toThrow(NotFoundError);
  });
});
