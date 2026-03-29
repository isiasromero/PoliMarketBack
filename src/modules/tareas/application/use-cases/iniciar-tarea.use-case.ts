import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Tarea } from '../../domain/entities/tarea.entity';
import {
  ITareaRepository,
  TAREA_REPOSITORY_TOKEN,
} from '../../domain/ports/tarea.repository.port';

/**
 * Use Case: Iniciar Tarea
 * Cambia el estado de una tarea de PENDIENTE a EN_PROGRESO
 */
@Injectable()
export class IniciarTareaUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY_TOKEN)
    private readonly tareaRepository: ITareaRepository,
  ) {}

  async execute(idTarea: number): Promise<Result<Tarea>> {
    if (!idTarea || idTarea <= 0) {
      return err('ID de tarea inválido');
    }

    const tarea = await this.tareaRepository.obtenerPorId(idTarea);
    if (!tarea) {
      return err('Tarea no encontrada');
    }

    tarea.iniciar();
    const tareaActualizada = await this.tareaRepository.actualizar(tarea);
    return ok(tareaActualizada);
  }
}
