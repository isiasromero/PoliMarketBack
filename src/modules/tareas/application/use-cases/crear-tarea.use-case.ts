import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Tarea } from '../../domain/entities/tarea.entity';
import {
  ITareaRepository,
  TAREA_REPOSITORY_TOKEN,
} from '../../domain/ports/tarea.repository.port';

interface CrearTareaInput {
  sellerId: number;
  title: string;
  description?: string;
  type: 'VENTA' | 'ENTREGA' | 'LLAMADA' | 'SEGUIMIENTO' | 'DEMO' | 'REUNION';
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  dueDate: string; // ISO string
}

/**
 * Use Case: Crear Tarea
 * Crea una nueva tarea en estado PENDIENTE asignada a un vendedor
 */
@Injectable()
export class CrearTareaUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY_TOKEN)
    private readonly tareaRepository: ITareaRepository,
  ) {}

  async execute(input: CrearTareaInput): Promise<Result<Tarea>> {
    if (!input?.sellerId || input.sellerId <= 0) return err('ID de vendedor inválido');
    if (!input?.title || input.title.trim().length === 0) return err('Título requerido');
    if (!input?.type) return err('Tipo de tarea requerido');
    if (!input?.priority) return err('Prioridad requerida');
    if (!input?.dueDate) return err('Fecha de vencimiento requerida');

    const now = new Date();
    const due = new Date(input.dueDate);
    if (isNaN(due.getTime())) return err('Fecha de vencimiento inválida');

    const tarea = new Tarea(
      0, // idTarea (autogenerado)
      input.sellerId,
      input.title,
      input.type,
      'PENDIENTE',
      input.priority,
      due,
      now,
      input.description,
    );

    const creada = await this.tareaRepository.crear(tarea);
    return ok(creada);
  }
}

