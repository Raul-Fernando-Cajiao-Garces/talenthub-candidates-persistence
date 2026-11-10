import { Router } from 'express';

import { DomainError } from '../../../../shared/DomainError';
import { HTTP_STATUS } from '../../../../shared/httpStatus';
import { CandidateService } from '../../application/CandidateService';

// Función flecha auxiliar para validar y convertir el :id de la ruta
const parseId = (value: string): number => {
  const id = Number(value);

  // Debe ser un entero positivo válido
  if (!Number.isInteger(id) || id <= 0) {
    throw new DomainError('El identificador no es válido');
  }

  return id;
};

// Función flecha creadora de router HTTP para candidatos
export const createCandidateRouter = (service: CandidateService): Router => {
  const router = Router();

  // GET /candidates → listar todos los candidatos
  router.get('/', async (req, res) => {
    const candidates = await service.list();
    res.status(HTTP_STATUS.OK).json(candidates);
  });

  // GET /candidates/:id → ver un candidato por id
  router.get('/:id', async (req, res) => {
    const candidate = await service.getById(parseId(req.params.id));
    res.status(HTTP_STATUS.OK).json(candidate);
  });

  // POST /candidates → crear un candidato
  router.post('/', async (req, res) => {
    const candidate = await service.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(candidate);
  });

  // PUT /candidates/:id → editar un candidato por id
  router.put('/:id', async (req, res) => {
    const candidate = await service.update(parseId(req.params.id), req.body);
    res.status(HTTP_STATUS.OK).json(candidate);
  });

  // DELETE /candidates/:id → eliminar un candidato por id
  router.delete('/:id', async (req, res) => {
    await service.remove(parseId(req.params.id));
    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  return router;
};
