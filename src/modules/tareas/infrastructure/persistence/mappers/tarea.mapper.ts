import { Tarea } from '../../../domain/entities/tarea.entity';
import { TareaOrmEntity } from '../entities/tarea.orm-entity';

/**
 * Mapper responsible for converting between the Tarea domain entity
 * and its corresponding TypeORM persistence model.
 */
export class TareaMapper {
  /**
   * Converts a TareaOrmEntity (persistence) to a Tarea (domain).
   * @param orm - The TypeORM task entity to convert
   * @returns A Tarea domain entity
   */
  static toDomain(orm: TareaOrmEntity): Tarea {
    return new Tarea(
      orm.id,
      orm.sellerId,
      orm.title,
      orm.type as 'VENTA' | 'ENTREGA' | 'LLAMADA' | 'SEGUIMIENTO' | 'DEMO' | 'REUNION',
      orm.status as 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ATRASADA',
      orm.priority as 'ALTA' | 'MEDIA' | 'BAJA',
      orm.dueDate,
      orm.createdAt,
      orm.description,
      orm.completionDate,
    );
  }

  /**
   * Converts a Tarea (domain) to a TareaOrmEntity (persistence).
   * @param domain - The domain task entity to convert
   * @returns A TareaOrmEntity ready for TypeORM operations
   */
  static toOrm(domain: Tarea): TareaOrmEntity {
    const orm = new TareaOrmEntity();
    if (domain.idTarea) {
      orm.id = domain.idTarea;
    }
    orm.sellerId = domain.idVendedor;
    orm.title = domain.titulo;
    orm.description = domain.descripcion;
    orm.type = domain.tipo;
    orm.status = domain.estado;
    orm.priority = domain.prioridad;
    orm.dueDate = domain.fechaVencimiento;
    orm.createdAt = domain.fechaCreacion;
    orm.completionDate = domain.fechaCompletacion;
    return orm;
  }
}
