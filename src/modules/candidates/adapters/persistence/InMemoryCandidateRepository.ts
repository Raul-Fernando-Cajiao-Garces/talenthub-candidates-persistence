import { Candidate, NewCandidate } from '../../domain/Candidate';
import { CandidateRepository } from '../../ports/CandidateRepository';

// Adaptador de salida: implementa CandidateRepository en memoria
export class InMemoryCandidateRepository implements CandidateRepository {
  private candidates: Candidate[];
  private nextId: number;

  constructor(initialCandidates: Candidate[] = []) {
    this.candidates = initialCandidates.map((item) => ({
      ...item,
      skills: [...(item.skills ?? [])],
    }));
    this.nextId =
      initialCandidates.length > 0
        ? Math.max(...initialCandidates.map((c) => c.id)) + 1
        : 1;
  }

  // Devuelve copias seguras de todos los candidatos
  findAll = async (): Promise<Candidate[]> =>
    this.candidates.map((item) => ({
      ...item,
      skills: [...item.skills],
    }));

  // Busca por id y devuelve una copia si existe
  findById = async (id: number): Promise<Candidate | undefined> => {
    const candidate = this.candidates.find((item) => item.id === id);
    return candidate
      ? {
          ...candidate,
          skills: [...candidate.skills],
        }
      : undefined;
  };

  // Guarda un candidato asignando id incremental y devuelve una copia
  save = async (newCandidate: NewCandidate): Promise<Candidate> => {
    const candidate: Candidate = {
      id: this.nextId++,
      ...newCandidate,
      skills: [...newCandidate.skills],
    };
    this.candidates.push({ ...candidate, skills: [...candidate.skills] });
    return { ...candidate, skills: [...candidate.skills] };
  };

  // Actualiza los datos de un candidato existente conservando el id
  update = async (id: number, data: NewCandidate): Promise<Candidate | undefined> => {
    const index = this.candidates.findIndex((item) => item.id === id);
    if (index === -1) {
      return undefined;
    }

    const updated: Candidate = {
      id,
      ...data,
      skills: [...data.skills],
    };
    this.candidates[index] = { ...updated, skills: [...updated.skills] };
    return { ...updated, skills: [...updated.skills] };
  };

  // Elimina el candidato de la lista
  remove = async (id: number): Promise<boolean> => {
    const index = this.candidates.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    this.candidates.splice(index, 1);
    return true;
  };
}
