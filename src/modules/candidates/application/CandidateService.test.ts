import { DomainError } from '../../../shared/DomainError';
import { NotFoundError } from '../../../shared/NotFoundError';
import { InMemoryCandidateRepository } from '../adapters/persistence/InMemoryCandidateRepository';
import { CandidateService } from './CandidateService';

const sampleInput = {
  name: 'Carlos Mendoza',
  email: 'carlos.mendoza@example.com',
  city: 'Quito',
  experienceYears: 5,
};

const createService = (): CandidateService =>
  new CandidateService(new InMemoryCandidateRepository());

describe('CandidateService', () => {
  it('creates a candidate with valid data and returns it with an id', async () => {
    const service = createService();
    const created = await service.create(sampleInput);

    expect(created).toEqual({ id: 1, ...sampleInput });
  });

  it('rejects an invalid candidate and does not save it', async () => {
    const service = createService();

    await expect(
      service.create({ email: 'carlos@example.com', city: 'Quito' }),
    ).rejects.toThrow(DomainError);

    expect(await service.list()).toEqual([]);
  });

  it('lists the candidates that were created', async () => {
    const service = createService();
    await service.create(sampleInput);

    const list = await service.list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject(sampleInput);
  });

  it('gets a candidate by id and throws NotFoundError when it does not exist', async () => {
    const service = createService();
    const created = await service.create(sampleInput);

    expect(await service.getById(created.id)).toEqual(created);
    await expect(service.getById(999)).rejects.toThrow(NotFoundError);
  });

  it('updates a candidate with valid data and throws NotFoundError when not found', async () => {
    const service = createService();
    const created = await service.create(sampleInput);

    const updated = await service.update(created.id, {
      ...sampleInput,
      experienceYears: 6,
    });

    expect(updated).toEqual({ id: created.id, ...sampleInput, experienceYears: 6 });

    // Falla si el id no existe
    await expect(service.update(999, sampleInput)).rejects.toThrow(NotFoundError);

    // Falla si los datos son inválidos
    await expect(
      service.update(created.id, { ...sampleInput, email: 'correo-malo' }),
    ).rejects.toThrow(DomainError);
  });

  it('removes a candidate and throws NotFoundError when it does not exist', async () => {
    const service = createService();
    const created = await service.create(sampleInput);

    await service.remove(created.id);
    expect(await service.list()).toEqual([]);

    await expect(service.remove(created.id)).rejects.toThrow(NotFoundError);
  });
});
