import { DomainError } from '../../../shared/DomainError';
import { parseNewCandidate } from './Candidate';

describe('parseNewCandidate', () => {
  it('returns valid candidate data trimmed', () => {
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
    });
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
