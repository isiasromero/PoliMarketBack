import { Tarea } from '../entities/tarea.entity';

/**
 * Puerto: TareaRepository
 * Define el contrato para las operaciones de persistencia de Tareas
 */
export interface ITareaRepository {
  crear(tarea: Tarea): Promise<Tarea>;
  obtenerPorId(idTarea: number): Promise<Tarea | null>;
  obtenerPorVendedor(idVendedor: number): Promise<Tarea[]>;
  obtenerTodas(): Promise<Tarea[]>;
  actualizar(tarea: Tarea): Promise<Tarea>;
  eliminar(idTarea: number): Promise<void>;
  obtenerPendientes(): Promise<Tarea[]>;
  obtenerPorEstado(estado: string): Promise<Tarea[]>;
}

export const TAREA_REPOSITORY_TOKEN = Symbol('TAREA_REPOSITORY_TOKEN');
