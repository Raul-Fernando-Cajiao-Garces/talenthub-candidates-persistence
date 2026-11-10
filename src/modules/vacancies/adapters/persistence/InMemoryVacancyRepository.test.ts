import { InMemoryVacancyRepository } from './InMemoryVacancyRepository';

// Datos de ejemplo (datos de prueba en español).
const sampleVacancy = { title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 };

describe('InMemoryVacancyRepository', () => {
  it('starts empty when no initial vacancies are given', async () => {
    const repository = new InMemoryVacancyRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy and assigns an id', async () => {
    const repository = new InMemoryVacancyRepository();

    const saved = await repository.save(sampleVacancy);

    expect(saved).toEqual({ id: 1, ...sampleVacancy });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    const repository = new InMemoryVacancyRepository();

    await repository.save(sampleVacancy);
    const second = await repository.save(sampleVacancy);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('finds a vacancy by id and returns undefined when it does not exist', async () => {
    const repository = new InMemoryVacancyRepository();
    const saved = await repository.save(sampleVacancy);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('updates an existing vacancy and keeps its id', async () => {
    const repository = new InMemoryVacancyRepository();
    const saved = await repository.save(sampleVacancy);

    const updated = await repository.update(saved.id, { ...sampleVacancy, salary: 1000 });

    expect(updated).toEqual({ id: saved.id, ...sampleVacancy, salary: 1000 });
    expect(await repository.update(999, sampleVacancy)).toBeUndefined();
  });

  it('removes a vacancy and reports whether it existed', async () => {
    const repository = new InMemoryVacancyRepository();
    const saved = await repository.save(sampleVacancy);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });
});
