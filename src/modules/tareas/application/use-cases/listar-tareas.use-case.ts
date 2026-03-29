import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Tarea } from '../../domain/entities/tarea.entity';
import { ITareaRepository, TAREA_REPOSITORY_TOKEN } from '../../domain/ports/tarea.repository.port';

export interface ListarTareasFiltro {
  sellerId?: number;
  status?: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ATRASADA';
}

/**
 * Use Case: Listar Tareas
 * Lista tareas con filtros opcionales por vendedor y estado.
 */
@Injectable()
export class ListarTareasUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY_TOKEN)
    private readonly tareaRepository: ITareaRepository,
  ) {}

  async execute(filtro: ListarTareasFiltro = {}): Promise<Result<Tarea[]>> {
    const { sellerId, status } = filtro;

    if (sellerId && status) {
      const porVendedor = await this.tareaRepository.obtenerPorVendedor(sellerId);
      return ok(porVendedor.filter((t) => t.estado === status));
    }

    if (sellerId) {
      const porVendedor = await this.tareaRepository.obtenerPorVendedor(sellerId);
      return ok(porVendedor);
    }

    if (status) {
      const porEstado = await this.tareaRepository.obtenerPorEstado(status);
      return ok(porEstado);
    }

    const todas = await this.tareaRepository.obtenerTodas();
    return ok(todas);
  }
}

