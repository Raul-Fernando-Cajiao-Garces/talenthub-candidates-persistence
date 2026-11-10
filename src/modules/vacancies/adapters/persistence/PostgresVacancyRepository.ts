import {Pool} from 'pg';

import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

//Cómo llega una fila desde la base de datos.
type VacancyRow ={
    id: number;
    title: string;
    company: string;
    modality: string;
    salary: string;
}

//Columnas solicitadas en cada consulta.
const COLUMNS = 'id, title, company, modality, salary';

//Convertir una fila d ela base de datos en un obnjeto Vacancy (dominio).
const toVacancy = (row: VacancyRow): Vacancy => ({
    id: row.id,
    title: row.title,
    company: row.company,
    modality: row.modality,
    salary: Number(row.salary)
}); 


export class PostgresVacancyRepository implements VacancyRepository {
    constructor(private readonly pool: Pool) {}

    //Lista de vacantes.
    findAll = async (): Promise<Vacancy[]> => {
        const result = await this.pool.query<VacancyRow>(`SELECT ${COLUMNS} FROM vacancies ORDER BY id`);
        return result.rows.map(toVacancy);
    }

    //Busca una vancante por id.
    findById = async (id: number): Promise<Vacancy | undefined> => {
        const result = await this.pool.query<VacancyRow>(`SELECT ${COLUMNS} FROM vacancies WHERE id = $1`, [id]);
        return result.rows[0] ? toVacancy(result.rows[0]) : undefined;

    }

    //Guardar una vacante
    save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
        const result = await this.pool.query<VacancyRow>(
            `INSERT INTO vacancies (title, company, modality, salary)
            VALUES($1, $2, $3, $4)
            RETURNING ${COLUMNS}`,
            [newVacancy.title, newVacancy.company, newVacancy.modality, newVacancy.salary],
        );
        return toVacancy(result.rows[0]);
    };

    //Actualizar los datos de una vacante.
    update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
        const result = await this.pool.query<VacancyRow>(
            `UPDATE vacancies
            SET title = $1, company = $2, modality = $3, salary = $4
            WHERE id = $5
            RETURNING ${COLUMNS}`,
            [data.title, data.company, data.modality, data.salary, id],
        );
        return result.rows[0] ? toVacancy(result.rows[0]) : undefined;
    };

    //Eliminar una vacante.
    remove = async (id: number): Promise<boolean> => {
        const result = await this.pool.query(`DELETE FROM vacancies WHERE id = $1`, [id]);
        return (result.rowCount ?? 0) > 0;
    };
}



