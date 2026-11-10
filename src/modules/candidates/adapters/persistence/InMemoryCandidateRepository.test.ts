import { InMemoryCandidateRepository } from './InMemoryCandidateRepository';

const sampleCandidate = {
  name: 'Ana Gómez',
  email: 'ana.gomez@example.com',
  city: 'Guayaquil',
  experienceYears: 4,
};

describe('InMemoryCandidateRepository', () => {
  it('starts empty when no initial candidates are provided', async () => {
    const repository = new InMemoryCandidateRepository();
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a candidate and assigns an id', async () => {
    const repository = new InMemoryCandidateRepository();
    const saved = await repository.save(sampleCandidate);

    expect(saved).toEqual({ id: 1, ...sampleCandidate });
  });

  it('lists candidates and returns safe copies', async () => {
    const repository = new InMemoryCandidateRepository();
    await repository.save(sampleCandidate);
    const list = await repository.findAll();

    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({ id: 1, ...sampleCandidate });

    // Modificar la copia no debe alterar el estado interno
    list[0].name = 'Otro Nombre';
    const listAgain = await repository.findAll();
    expect(listAgain[0].name).toBe('Ana Gómez');
  });

  it('finds a candidate by id and returns undefined when it does not exist', async () => {
    const repository = new InMemoryCandidateRepository();
    const saved = await repository.save(sampleCandidate);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('updates an existing candidate and returns undefined when not found', async () => {
    const repository = new InMemoryCandidateRepository();
    const saved = await repository.save(sampleCandidate);

    const updated = await repository.update(saved.id, {
      ...sampleCandidate,
      city: 'Cuenca',
    });

    expect(updated).toEqual({ id: saved.id, ...sampleCandidate, city: 'Cuenca' });
    expect(await repository.update(999, sampleCandidate)).toBeUndefined();
  });

  it('removes a candidate and reports whether it existed', async () => {
    const repository = new InMemoryCandidateRepository();
    const saved = await repository.save(sampleCandidate);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });
});
