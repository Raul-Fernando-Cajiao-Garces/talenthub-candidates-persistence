import { NotFoundError } from '../../../shared/NotFoundError';
import { Candidate, parseNewCandidate } from '../domain/Candidate';
import { CandidateRepository } from '../ports/CandidateRepository';

const CANDIDATE_NOT_FOUND_MESSAGE = 'Candidato no encontrado';

// Capa de aplicación: agrupa los casos de uso para Candidates
export class CandidateService {
  constructor(private readonly repository: CandidateRepository) {}

  // Caso de uso: listar todos los candidatos
  list = async (): Promise<Candidate[]> => this.repository.findAll();

  // Caso de uso: obtener candidato por id
  getById = async (id: number): Promise<Candidate> => {
    const candidate = await this.repository.findById(id);

    if (!candidate) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }

    return candidate;
  };

  // Caso de uso: crear un candidato
  create = async (input: unknown): Promise<Candidate> => {
    const newCandidate = parseNewCandidate(input);
    return this.repository.save(newCandidate);
  };

  // Caso de uso: editar un candidato existente
  update = async (id: number, input: unknown): Promise<Candidate> => {
    const data = parseNewCandidate(input);
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }

    return updated;
  };

  // Caso de uso: eliminar un candidato
  remove = async (id: number): Promise<void> => {
    const removed = await this.repository.remove(id);

    if (!removed) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }
  };
}
