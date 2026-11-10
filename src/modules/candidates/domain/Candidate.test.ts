import { DomainError } from '../../../shared/DomainError';
import { parseNewCandidate } from './Candidate';

describe('parseNewCandidate', () => {
  it('returns valid candidate data trimmed with default empty skills list', () => {
    const validCandidate = {
      name: '  Juan Pérez  ',
      email: '  juan.perez@example.com  ',
      city: '  Quito  ',
      experienceYears: 3,
    };

    const result = parseNewCandidate(validCandidate);

    expect(result).toEqual({
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      city: 'Quito',
      experienceYears: 3,
      skills: [],
    });
  });

  it('accepts a valid list of skills and trims each text', () => {
    const candidateWithSkills = {
      name: 'Ana Torres',
      email: 'ana@correo.com',
      city: 'Quito',
      experienceYears: 2,
      skills: ['  TypeScript  ', 'SQL  ', 'Node.js'],
    };

    const result = parseNewCandidate(candidateWithSkills);

    expect(result.skills).toEqual(['TypeScript', 'SQL', 'Node.js']);
  });

  it('throws DomainError when skills is not a list of non-empty texts', () => {
    // Caso 1: skills no es un array (es un string)
    expect(() =>
      parseNewCandidate({
        name: 'Ana Torres',
        email: 'ana@correo.com',
        city: 'Quito',
        experienceYears: 2,
        skills: 'TypeScript',
      }),
    ).toThrow('Las habilidades deben ser una lista de textos');

    // Caso 2: skills contiene textos vacíos o solo espacios
    expect(() =>
      parseNewCandidate({
        name: 'Ana Torres',
        email: 'ana@correo.com',
        city: 'Quito',
        experienceYears: 2,
        skills: ['TypeScript', '   '],
      }),
    ).toThrow('Las habilidades deben ser una lista de textos');

    // Caso 3: skills contiene elementos que no son texto (números)
    expect(() =>
      parseNewCandidate({
        name: 'Ana Torres',
        email: 'ana@correo.com',
        city: 'Quito',
        experienceYears: 2,
        skills: ['TypeScript', 123],
      }),
    ).toThrow('Las habilidades deben ser una lista de textos');
  });

  it('throws when name or email is missing', () => {
    expect(() =>
      parseNewCandidate({
        email: 'juan@example.com',
        city: 'Quito',
        experienceYears: 2,
      }),
    ).toThrow(DomainError);

    expect(() =>
      parseNewCandidate({
        name: 'Juan',
        city: 'Quito',
        experienceYears: 2,
      }),
    ).toThrow('El nombre y el correo son obligatorios');
  });

  it('throws when email format is invalid', () => {
    expect(() =>
      parseNewCandidate({
        name: 'Juan Pérez',
        email: 'correo-invalido',
        city: 'Quito',
        experienceYears: 2,
      }),
    ).toThrow('El correo no tiene un formato válido');
  });

  it('throws when city is missing', () => {
    expect(() =>
      parseNewCandidate({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        city: '   ',
        experienceYears: 2,
      }),
    ).toThrow('La ciudad es obligatoria');
  });

  it('throws when experienceYears is negative or not a number', () => {
    expect(() =>
      parseNewCandidate({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        city: 'Quito',
        experienceYears: -1,
      }),
    ).toThrow('Los años de experiencia deben ser un número igual o mayor que 0');

    expect(() =>
      parseNewCandidate({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        city: 'Quito',
        experienceYears: 'cinco',
      }),
    ).toThrow('Los años de experiencia deben ser un número igual o mayor que 0');
  });
});
