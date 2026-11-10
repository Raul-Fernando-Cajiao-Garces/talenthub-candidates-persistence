import {Pool} from 'pg';

//Crear el pool a partir de la cadena de conexión.
export const createPostgresPool = (connectionString: string): Pool => new Pool({connectionString});