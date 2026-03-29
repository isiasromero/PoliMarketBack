import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Tarea } from '../../domain/entities/tarea.entity';
import {
  ITareaRepository,
  TAREA_REPOSITORY_TOKEN,
} from '../../domain/ports/tarea.repository.port';

/**
 * Use Case: Obtener Tareas por Vendedor
 * Recupera todas las tareas asignadas a un vendedor específico
 */
@Injectable()
export class ObtenerTareasPorVendedorUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY_TOKEN)
    private readonly tareaRepository: ITareaRepository,
  ) {}

  async execute(idVendedor: number): Promise<Result<Tarea[]>> {
    if (!idVendedor || idVendedor <= 0) {
      return err('ID de vendedor inválido');
    }

    const tareas = await this.tareaRepository.obtenerPorVendedor(idVendedor);
    return ok(tareas);
  }
}
