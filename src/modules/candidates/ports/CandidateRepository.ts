import { Candidate, NewCandidate } from '../domain/Candidate';

// Contrato que define las operaciones del repositorio de candidatos
export interface CandidateRepository {
  // Devuelve todos los candidatos
  findAll: () => Promise<Candidate[]>;

  // Busca un candidato por id o retorna undefined
  findById: (id: number) => Promise<Candidate | undefined>;

  // Guarda un nuevo candidato y retorna el candidato con id
  save: (newCandidate: NewCandidate) => Promise<Candidate>;

  // Actualiza los datos de un candidato existente o retorna undefined si no existe
  update: (id: number, data: NewCandidate) => Promise<Candidate | undefined>;

  // Elimina un candidato retornando true si existía o false si no
  remove: (id: number) => Promise<boolean>;
}
