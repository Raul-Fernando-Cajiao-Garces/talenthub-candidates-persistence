-- Crea la tabla de vacantes 
CREATE TABLE IF NOT EXISTS vacancies (

  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  title VARCHAR(150) NOT NULL,

  company VARCHAR(150) NOT NULL,

  modality VARCHAR(30) NOT NULL,

  salary NUMERIC(10, 2) NOT NULL CHECK (salary > 0)
);