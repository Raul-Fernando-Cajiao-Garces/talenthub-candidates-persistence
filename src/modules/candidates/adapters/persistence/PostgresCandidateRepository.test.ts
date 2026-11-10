// Carga variables de entorno para tener TEST_DATABASE_URL
import 'dotenv/config';

import { Pool } from 'pg';

import { createPostgresPool } from '../../../../shared/database/postgresPool';
import { PostgresCandidateRepository } from './PostgresCandidateRepository';

// Protección exigida por la rúbrica: falla si la base de desarrollo y la de pruebas son iguales
const ensureDifferentDatabases = (devUrl?: string, testUrl?: string): void => {
  if (devUrl && testUrl && devUrl.trim() === testUrl.trim()) {
    throw new Error('DATABASE_URL y TEST_DATABASE_URL deben ser diferentes para evitar pérdida de datos');
  }
};

ensureDifferentDatabases(process.env.DATABASE_URL, process.env.TEST_DATABASE_URL);

const sampleCandidate = {
  name: 'Ana Torres',
  email: 'ana@correo.com',
  city: 'Quito',
  experienceYears: 2,
  skills: ['TypeScript', 'SQL'],
};

describe('PostgresCandidateRepository', () => {
  let pool: Pool;
  let repository: PostgresCandidateRepository;

  // Se ejecuta UNA vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS
  beforeAll(() => {
    pool = createPostgresPool(process.env.TEST_DATABASE_URL as string);
    repository = new PostgresCandidateRepository(pool);
  });

  // Se ejecuta antes de CADA prueba: vacía la tabla y reinicia el contador de ids en 1
  beforeEach(async () => {
    await pool.query('TRUNCATE candidates RESTART IDENTITY');
  });

  // Se ejecuta UNA vez al final: cierra la conexión del pool para que Jest termine limpiamente
  afterAll(async () => {
    await pool.end();
  });

  // Prueba 1: Repositorio vacío
  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  // Prueba 2: Guardar y asignar id, comprobando que skills se guarda y recupera sin cambios
  it('saves a candidate, assigns an id, and preserves skills without changes', async () => {
    const saved = await repository.save(sampleCandidate);

    expect(saved).toEqual({
      id: 1,
      name: 'Ana Torres',
      email: 'ana@correo.com',
      city: 'Quito',
      experienceYears: 2,
      skills: ['TypeScript', 'SQL'],
    });
    expect(saved.skills).toEqual(sampleCandidate.skills);
  });

  // Prueba 3: Listar candidatos guardados con ids incrementales
  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleCandidate);
    const second = await repository.save({
      name: 'Carlos Mendoza',
      email: 'carlos@correo.com',
      city: 'Guayaquil',
      experienceYears: 5,
      skills: ['PostgreSQL', 'Docker'],
    });

    expect(second.id).toBe(2);
    const all = await repository.findAll();
    expect(all).toHaveLength(2);
    expect(all[0].name).toBe('Ana Torres');
    expect(all[1].name).toBe('Carlos Mendoza');
    expect(all[1].skills).toEqual(['PostgreSQL', 'Docker']);
  });

  // Prueba 4: Buscar por id (existente e inexistente)
  it('finds a candidate by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleCandidate);

    const found = await repository.findById(saved.id);
    expect(found).toEqual(saved);

    const notFound = await repository.findById(999);
    expect(notFound).toBeUndefined();
  });

  // Prueba 5: Editar candidato existente y verificar retorno undefined si no existe
  it('updates an existing candidate, keeps its id, and updates skills', async () => {
    const saved = await repository.save(sampleCandidate);

    const updated = await repository.update(saved.id, {
      name: 'Ana Torres Actualizada',
      email: 'ana.actualizada@correo.com',
      city: 'Cuenca',
      experienceYears: 3,
      skills: ['TypeScript', 'SQL', 'NestJS'],
    });

    expect(updated).toEqual({
      id: saved.id,
      name: 'Ana Torres Actualizada',
      email: 'ana.actualizada@correo.com',
      city: 'Cuenca',
      experienceYears: 3,
      skills: ['TypeScript', 'SQL', 'NestJS'],
    });

    // Intento de actualización de registro inexistente
    expect(await repository.update(999, sampleCandidate)).toBeUndefined();
  });

  // Prueba 6: Eliminar candidato y reportar si existía
  it('removes a candidate and reports whether it existed', async () => {
    const saved = await repository.save(sampleCandidate);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });

  // Prueba 7: Verifica la protección ante URLs de desarrollo y pruebas idénticas
  it('fails with an error if development and test database URLs are identical', () => {
    const identicalUrl = 'postgresql://postgres:root@localhost:5432/same_db';
    expect(() => ensureDifferentDatabases(identicalUrl, identicalUrl)).toThrow(
      'DATABASE_URL y TEST_DATABASE_URL deben ser diferentes para evitar pérdida de datos',
    );
  });
});
