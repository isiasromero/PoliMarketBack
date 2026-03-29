/**
 * Clase que representa un error en la aplicación.
 * Proporciona una estructura consistente para errores con código, mensaje y detalles.
 *
 * @example
 * const error = new AppError('USUARIO_NO_ENCONTRADO', 'El usuario no existe', { userId: '123' });
 */
export class AppError {
  /**
   * Código único del error (ej: USER_NOT_FOUND)
   */
  readonly codigo: string;

  /**
   * Mensaje descriptivo del error en español
   */
  readonly mensaje: string;

  /**
   * Detalles adicionales del error (contexto)
   */
  readonly detalles?: Record<string, any>;

  /**
   * Marca de tiempo del error
   */
  readonly timestamp: Date;

  constructor(
    codigo: string,
    mensaje: string,
    detalles?: Record<string, any>,
  ) {
    this.codigo = codigo;
    this.mensaje = mensaje;
    this.detalles = detalles;
    this.timestamp = new Date();
  }

  /**
   * Retorna una representación en string del error
   */
  toString(): string {
    return `[${this.codigo}] ${this.mensaje}`;
  }
}

/**
 * Patrón Result para manejo de errores sin excepciones.
 * Se utiliza en toda la capa de aplicación para representar éxito o fallo
 * de operaciones de forma segura y predecible.
 *
 * @template T - Tipo del valor en caso de éxito
 * @template E - Tipo del error (por defecto string)
 *
 * @example
 * // Opción 1: Con strings (más simple)
 * type ResultadoUsuario = Result<Usuario>;
 *
 * function obtenerUsuario(id: string): Promise<ResultadoUsuario> {
 *   if (!id) {
 *     return err('El ID no es válido');
 *   }
 *   return ok(usuario);
 * }
 *
 * @example
 * // Opción 2: Con AppError (más descriptivo)
 * type ResultadoUsuario = Result<Usuario, AppError>;
 *
 * function obtenerUsuario(id: string): Promise<ResultadoUsuario> {
 *   if (!id) {
 *     return err(new AppError('USUARIO_ID_INVALIDO', 'El ID no es válido'));
 *   }
 *   const usuario = await db.findUser(id);
 *   if (!usuario) {
 *     return err(new AppError('USUARIO_NO_ENCONTRADO', `Usuario ${id} no existe`));
 *   }
 *   return ok(usuario);
 * }
 */
export type Result<T, E = string> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Crea un Result exitoso con el valor proporcionado.
 *
 * @param valor - El valor a envolver
 * @returns Un Result indicando éxito
 *
 * @example
 * const resultado = ok({ id: '1', nombre: 'Juan' });
 * // { success: true, value: { id: '1', nombre: 'Juan' } }
 */
export const ok = <T>(valor: T): Result<T, never> => ({
  success: true,
  value: valor,
});

/**
 * Crea un Result fallido con el error proporcionado.
 *
 * @param error - El error a envolver (puede ser AppError o string)
 * @returns Un Result indicando fallo
 *
 * @example
 * const resultado = err(new AppError('NO_ENCONTRADO', 'Recurso no existe'));
 * // { success: false, error: AppError }
 */
export const err = <E = AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Verifica si un Result es exitoso.
 *
 * @param resultado - El Result a verificar
 * @returns true si el Result es exitoso, false en caso contrario
 *
 * @example
 * if (esExito(resultado)) {
 *   console.log('Operación exitosa:', resultado.value);
 * }
 */
export const esExito = <T, E>(resultado: Result<T, E>): resultado is { success: true; value: T } => {
  return resultado.success === true;
};

/**
 * Verifica si un Result es un error.
 *
 * @param resultado - El Result a verificar
 * @returns true si el Result es un error, false en caso contrario
 *
 * @example
 * if (esFallo(resultado)) {
 *   console.error('Error:', resultado.error.mensaje);
 * }
 */
export const esFallo = <T, E>(resultado: Result<T, E>): resultado is { success: false; error: E } => {
  return resultado.success === false;
};

/**
 * Obtiene el valor de un Result exitoso o lanza una excepción si es un error.
 * Útil cuando estás seguro de que el resultado es exitoso.
 *
 * @param resultado - El Result del cual obtener el valor
 * @param mensaje - Mensaje de error opcional si falla
 * @returns El valor envuelto en el Result
 * @throws Error si el Result contiene un error
 *
 * @example
 * const usuario = obtenerOLanzar(resultado);
 *
 * // Con AppError
 * const usuario = obtenerOLanzar(
 *   resultado,
 *   (err) => err instanceof AppError ? err.mensaje : String(err)
 * );
 */
export const obtenerOLanzar = <T, E = string>(
  resultado: Result<T, E>,
  extraerMensaje?: (error: E) => string,
): T => {
  if (esFallo(resultado)) {
    const mensaje = extraerMensaje
      ? extraerMensaje(resultado.error)
      : String(resultado.error);
    throw new Error(`Operación fallida: ${mensaje}`);
  }
  return resultado.value;
};

/**
 * Transforma el valor de un Result exitoso sin afectar los errores.
 * Similar al método map() en programación funcional.
 *
 * @param resultado - El Result a transformar
 * @param transformar - Función que transforma el valor
 * @returns Un nuevo Result con el valor transformado
 *
 * @example
 * const resultadoId = mapear(
 *   obtenerUsuario('123'),
 *   (usuario) => usuario.id
 * );
 */
export const mapear = <T, U, E>(
  resultado: Result<T, E>,
  transformar: (valor: T) => U,
): Result<U, E> => {
  if (esFallo(resultado)) {
    return resultado;
  }
  return ok(transformar(resultado.value));
};

/**
 * Aplica una función que retorna un Result a un valor exitoso.
 * Encadena operaciones que pueden fallar.
 * Similar al método flatMap() o andThen() en programación funcional.
 *
 * @param resultado - El Result inicial
 * @param siguiente - Función que recibe el valor y retorna un nuevo Result
 * @returns El nuevo Result o el error original
 *
 * @example
 * const resultadoFinal = encadenar(
 *   obtenerUsuario('123'),
 *   (usuario) => obtenerCredenciales(usuario.id)
 * );
 */
export const encadenar = <T, U, E>(
  resultado: Result<T, E>,
  siguiente: (valor: T) => Result<U, E>,
): Result<U, E> => {
  if (esFallo(resultado)) {
    return resultado;
  }
  return siguiente(resultado.value);
};

/**
 * Ejecuta diferentes funciones según si el Result es exitoso o un error.
 * Útil para manejar ambos casos de forma declarativa.
 *
 * @param resultado - El Result a procesar
 * @param enExito - Función a ejecutar si es exitoso
 * @param enFallo - Función a ejecutar si es un error
 * @returns El resultado de ejecutar una de las dos funciones
 *
 * @example
 * const mensaje = plegar(
 *   obtenerUsuario('123'),
 *   (usuario) => `Bienvenido ${usuario.nombre}`,
 *   (error) => `Error: ${error.mensaje}`
 * );
 */
export const plegar = <T, U, E>(
  resultado: Result<T, E>,
  enExito: (valor: T) => U,
  enFallo: (error: E) => U,
): U => {
  if (esExito(resultado)) {
    return enExito(resultado.value);
  }
  return enFallo(resultado.error);
};
