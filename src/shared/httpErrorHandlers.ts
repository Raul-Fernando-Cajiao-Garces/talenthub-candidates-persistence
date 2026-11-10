import { NextFunction, Request, Response } from 'express';

import { DomainError } from './DomainError';
import { HTTP_STATUS } from './httpStatus';
import { NotFoundError } from './NotFoundError';

// Se ejecuta cuando ninguna ruta coincidió con la petición: la ruta no existe.
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Ruta no encontrada' });
};

// Manejador central de errores. Express lo reconoce porque tiene 4 parámetros.
export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // CASO 1: el recurso pedido no existe. Responde 404 con el mensaje que trae el error.
  if (err instanceof NotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: err.message });
    return;
  }

  // CASO 2: se rompió una regla de negocio. El usuario se equivocó: 400 con el mensaje del dominio.
  if (err instanceof DomainError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    return;
  }

  // CASO 3: otro error. Usa su código si lo trae (ej. 400 por JSON mal escrito); si no, 500.
  const status = err.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Los errores del servidor se registran en la consola para revisarlos después.
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  // Responde siempre en JSON y sin mostrar detalles internos al usuario.
  res.status(status).json({
    error: status < HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'La petición no es válida' : 'Error interno del servidor',
  });
};
