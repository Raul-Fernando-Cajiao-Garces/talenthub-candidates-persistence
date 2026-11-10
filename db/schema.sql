-- Crea la tabla de vacantes 
CREATE TABLE IF NOT EXISTS vacancies (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  modality VARCHAR(30) NOT NULL,
  salary NUMERIC(10, 2) NOT NULL CHECK (salary > 0)
);

-- Crea la tabla de candidatos
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  skills TEXT[] NOT NULL DEFAULT '{}'
);