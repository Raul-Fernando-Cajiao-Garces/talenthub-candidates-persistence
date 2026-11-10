import { Router } from "express";

import { DomainError } from "../../../../shared/DomainError";

import { HTTP_STATUS } from "../../../../shared/httpStatus";

import { VancacyService } from "../../application/VacancyService";

// Convierte el id que llega como texto ("5") en número (5) y comprueba que sea válido.
const parseId = (value: string): number => {
  // "Number" convierte el texto en número; si no se puede, devuelve NaN.
  const id = Number(value);

  // Debe ser un número entero y positivo (no "abc", ni 1.5, ni -3).
  if (!Number.isInteger(id) || id <= 0) {
    // Si no lo es, se lanza un error de negocio: el usuario envió un dato inválido.
    throw new DomainError("El identificador no es válido");
  }

  // Si es válido, lo devuelve ya convertido a número.
  return id;
};

// Recibe el servicio desde afuera (inyección de dependencias) y devuelve las rutas ya armadas.
export const createVacancyRouter = (service: VancacyService): Router => {
  // Crea el grupo de rutas vacío.
  const router = Router();

  // GET /vacancies → listar todas las vacantes.
  router.get("/", async (req, res) => {
    // Pide la lista al caso de uso "list".
    const vacancies = await service.list();

    // Responde 200 con la lista en JSON.
    res.status(HTTP_STATUS.OK).json(vacancies);
  });

  // GET /vacancies/:id → ver una vacante.
  router.get("/:id", async (req, res) => {
    // Lee el id de la dirección, lo valida y lo convierte; luego pide la vacante al caso de uso.
    const vacancy = await service.getById(parseId(req.params.id));

    // Responde 200 con la vacante.
    res.status(HTTP_STATUS.OK).json(vacancy);
  });

  // POST /vacancies → crear una vacante.
  router.post("/", async (req, res) => {
    // Pasa los datos del cuerpo al caso de uso; si son inválidos, el dominio lanza DomainError (→ 400).
    const vacancy = await service.create(req.body);

    // Responde 201 (creada) con la vacante y su id.
    res.status(HTTP_STATUS.CREATED).json(vacancy);
  });

  // PUT /vacancies/:id → editar una vacante.
  router.put("/:id", async (req, res) => {
    // Valida el id y pasa, junto con los datos nuevos, al caso de uso "update".
    const vacancy = await service.update(parseId(req.params.id), req.body);

    // Responde 200 con la vacante ya actualizada.
    res.status(HTTP_STATUS.OK).json(vacancy);
  });

  // DELETE /vacancies/:id → eliminar una vacante.
  router.delete("/:id", async (req, res) => {
    // Valida el id y pide al caso de uso que elimine; si no existe, lanza NotFoundError (→ 404).
    await service.remove(parseId(req.params.id));

    // Responde 204: salió bien y no hay contenido que devolver ("send" envía la respuesta vacía).
    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  // Devuelve el grupo de rutas listo para conectarlo en app.ts.
  return router;
};

