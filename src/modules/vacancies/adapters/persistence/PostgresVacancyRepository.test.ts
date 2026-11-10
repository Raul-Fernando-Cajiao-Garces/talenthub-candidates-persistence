// Carga el .env para tener TEST_DATABASE_URL | Jest no lo carga solo
import 'dotenv/config';

import { Pool } from 'pg';

import { createPostgresPool } from '../../../../shared/database/postgresPool';
import { PostgresVacancyRepository } from './PostgresVacancyRepository';

const sampleVacancy = { title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 };

describe('PostgresVacancyRepository', () => {
  let pool: Pool;
  let repository: PostgresVacancyRepository;

  // Se ejecuta UNA vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS
  beforeAll(() => {
    pool = createPostgresPool(process.env.TEST_DATABASE_URL as string);
    repository = new PostgresVacancyRepository(pool);
  });

  // Se ejecuta antes de CADA prueba: vacía la tabla y reinicia el contador de ids en 1
  beforeEach(async () => {
    await pool.query('TRUNCATE vacancies RESTART IDENTITY');
  });

  // Se ejecuta UNA vez al final: cierra las conexiones para que Jest pueda terminar
  afterAll(async () => {
    await pool.end();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy and assigns an id', async () => {
    const saved = await repository.save(sampleVacancy);

    // El salario vuelve como NÚMERO, gracias al mapeo del adaptador
    expect(saved).toEqual({ id: 1, ...sampleVacancy });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleVacancy);
    const second = await repository.save(sampleVacancy);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('finds a vacancy by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('updates an existing vacancy and keeps its id', async () => {
    const saved = await repository.save(sampleVacancy);

    const updated = await repository.update(saved.id, { ...sampleVacancy, salary: 1000 });

    expect(updated).toEqual({ id: saved.id, ...sampleVacancy, salary: 1000 });
    expect(await repository.update(999, sampleVacancy)).toBeUndefined();
  });

  it('removes a vacancy and reports whether it existed', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });
});
