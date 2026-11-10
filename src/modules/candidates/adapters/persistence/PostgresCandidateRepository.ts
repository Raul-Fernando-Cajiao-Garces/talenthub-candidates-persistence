import { Pool } from 'pg';

import { Candidate, NewCandidate } from '../../domain/Candidate';
import { CandidateRepository } from '../../ports/CandidateRepository';

// Cómo llega una fila desde la base de datos
type CandidateRow = {
  id: number;
  name: string;
  email: string;
  city: string;
  experience_years: number;
  skills: string[];
};

// Columnas solicitadas en cada consulta
const COLUMNS = 'id, name, email, city, experience_years, skills';

// Convertir una fila de la base de datos en un objeto Candidate (dominio)
const toCandidate = (row: CandidateRow): Candidate => ({
  id: row.id,
  name: row.name,
  email: row.email,
  city: row.city,
  experienceYears: row.experience_years,
  skills: row.skills ?? [],
});

export class PostgresCandidateRepository implements CandidateRepository {
  constructor(private readonly pool: Pool) {}

  // Lista de candidatos ordenada por id
  findAll = async (): Promise<Candidate[]> => {
    const result = await this.pool.query<CandidateRow>(
      `SELECT ${COLUMNS} FROM candidates ORDER BY id`,
    );
    return result.rows.map(toCandidate);
  };

  // Busca un candidato por id
  findById = async (id: number): Promise<Candidate | undefined> => {
    const result = await this.pool.query<CandidateRow>(
      `SELECT ${COLUMNS} FROM candidates WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? toCandidate(result.rows[0]) : undefined;
  };

  // Guarda un nuevo candidato y retorna el registro creado con su id asignado
  save = async (newCandidate: NewCandidate): Promise<Candidate> => {
    const result = await this.pool.query<CandidateRow>(
      `INSERT INTO candidates (name, email, city, experience_years, skills)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [
        newCandidate.name,
        newCandidate.email,
        newCandidate.city,
        newCandidate.experienceYears,
        newCandidate.skills,
      ],
    );
    return toCandidate(result.rows[0]);
  };

  // Actualiza los datos de un candidato existente o retorna undefined si no existe
  update = async (id: number, data: NewCandidate): Promise<Candidate | undefined> => {
    const result = await this.pool.query<CandidateRow>(
      `UPDATE candidates
       SET name = $1, email = $2, city = $3, experience_years = $4, skills = $5
       WHERE id = $6
       RETURNING ${COLUMNS}`,
      [data.name, data.email, data.city, data.experienceYears, data.skills, id],
    );
    return result.rows[0] ? toCandidate(result.rows[0]) : undefined;
  };

  // Elimina un candidato retornando true si existía o false si no
  remove = async (id: number): Promise<boolean> => {
    const result = await this.pool.query(`DELETE FROM candidates WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  };
}
