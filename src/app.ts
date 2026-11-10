import express from 'express';

import { InMemoryVacancyRepository } from './modules/vacancies/adapters/persistence/InMemoryVacancyRepository';
import { VancacyService } from './modules/vacancies/application/VacancyService';
import { createVacancyRouter } from './modules/vacancies/adapters/http/vacancyRoutes';
import { PostgresVacancyRepository } from './modules/vacancies/adapters/persistence/PostgresVacancyRepository';
import { VacancyRepository } from './modules/vacancies/ports/VacancyRepository';

import { InMemoryCandidateRepository } from './modules/candidates/adapters/persistence/InMemoryCandidateRepository';
import { PostgresCandidateRepository } from './modules/candidates/adapters/persistence/PostgresCandidateRepository';
import { CandidateRepository } from './modules/candidates/ports/CandidateRepository';
import { CandidateService } from './modules/candidates/application/CandidateService';
import { createCandidateRouter } from './modules/candidates/adapters/http/candidateRoutes';

import { createPostgresPool } from './shared/database/postgresPool';
import { errorHandler, notFoundHandler } from './shared/httpErrorHandlers';

const app = express();

app.use(express.json());

// Datos iniciales de vacantes para repositorio en memoria
const samplesVacancies = [
  { id: 1, title: 'Desarrollador Backend', company: 'Tech Ander', modality: 'remoto', salary: 800 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1200 },
];

// Ensamblado del módulo Vacancies
const vacancyRepository: VacancyRepository =
  process.env.NODE_ENV !== 'test' && process.env.DATABASE_URL
    ? new PostgresVacancyRepository(createPostgresPool(process.env.DATABASE_URL))
    : new InMemoryVacancyRepository(samplesVacancies);

const vancacyService = new VancacyService(vacancyRepository);
app.use('/vacancies', createVacancyRouter(vancacyService));

// Datos iniciales de candidatos para repositorio en memoria
const sampleCandidates = [
  {
    id: 1,
    name: 'Ana Gómez',
    email: 'ana.gomez@example.com',
    city: 'Quito',
    experienceYears: 3,
    skills: ['TypeScript', 'Node.js'],
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    city: 'Guayaquil',
    experienceYears: 5,
    skills: ['PostgreSQL', 'Express'],
  },
];

// Función para seleccionar el repositorio de Candidates según CANDIDATES_ADAPTER
export const selectCandidateRepository = (): CandidateRepository => {
  // Pruebas unitarias de la app se ejecutan en memoria sin depender de la base de datos
  if (process.env.NODE_ENV === 'test') {
    return new InMemoryCandidateRepository(sampleCandidates);
  }

  const adapter = process.env.CANDIDATES_ADAPTER;
  const dbUrl = process.env.DATABASE_URL;

  if (adapter === 'sql' && dbUrl) {
    console.log('Candidates persistence: PostgreSQL with pg');
    return new PostgresCandidateRepository(createPostgresPool(dbUrl));
  }

  console.log('Candidates persistence: InMemory');
  return new InMemoryCandidateRepository(sampleCandidates);
};

// Ensamblado del módulo Candidates (Arquitectura Hexagonal)
const candidateRepository = selectCandidateRepository();
const candidateService = new CandidateService(candidateRepository);
app.use('/candidates', createCandidateRouter(candidateService));

// Manejadores globales de rutas y errores (siempre al final de app.ts)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;