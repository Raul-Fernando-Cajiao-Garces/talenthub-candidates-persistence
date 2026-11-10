import { DomainError } from "../../../shared/DomainError";
import { parseNewVacancy } from "./Vacancy";

describe('parseNewVacancy', () =>{
    it('returns the vacancy data trimmed', () => {
        const result = parseNewVacancy({title: ' QA Tester ', company: 'Tech Andes', modality: 'remoto', salary: 800});

        expect(result).toEqual({title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800});
    });

    it('throws when a required field is missing', () => {
        expect(() => parseNewVacancy({company: 'Tech'})).toThrow(DomainError);
    });

    it('throws when salary is not a positive number', () => {
        expect(() => parseNewVacancy({title: 'QA', company: 'Tech', modality: 'remoto', salary: 0})).toThrow(DomainError);
    });
})