import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tarea } from '../../../domain/entities/tarea.entity';
import { ITareaRepository } from '../../../domain/ports/tarea.repository.port';
import { TareaOrmEntity } from '../entities/tarea.orm-entity';
import { TareaMapper } from '../mappers/tarea.mapper';

/**
 * TypeORM-based implementation of the ITareaRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 */
@Injectable()
export class TypeOrmTareaRepository implements ITareaRepository {
  constructor(
    @InjectRepository(TareaOrmEntity)
    private readonly ormRepository: Repository<TareaOrmEntity>,
  ) {}

  /**
   * Creates and persists a new Tarea to the database.
   * @param tarea - The Tarea domain entity to save
   * @returns The saved Tarea with generated ID
   */
  async crear(tarea: Tarea): Promise<Tarea> {
    const orm = TareaMapper.toOrm(tarea);
    const saved = await this.ormRepository.save(orm);
    return TareaMapper.toDomain(saved);
  }

  /**
   * Retrieves a task by its ID.
   * @param idTarea - The task ID to search for
   * @returns The found Tarea domain entity or null
   */
  async obtenerPorId(idTarea: number): Promise<Tarea | null> {
    const orm = await this.ormRepository.findOne({
      where: { id: idTarea },
    });
    return orm ? TareaMapper.toDomain(orm) : null;
  }

  /**
   * Retrieves all tasks assigned to a specific seller.
   * @param idVendedor - The seller ID to filter by
   * @returns An array of Tarea entities for the seller
   */
  async obtenerPorVendedor(idVendedor: number): Promise<Tarea[]> {
    const orms = await this.ormRepository.find({
      where: { sellerId: idVendedor },
      order: { createdAt: 'DESC' },
    });
    return orms.map(TareaMapper.toDomain);
  }

  /**
   * Retrieves all tasks from the database.
   * @returns An array of all Tarea entities
   */
  async obtenerTodas(): Promise<Tarea[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
    });
    return orms.map(TareaMapper.toDomain);
  }

  /**
   * Updates an existing task in the database.
   * @param tarea - The Tarea domain entity with updated values
   * @returns The updated Tarea
   */
  async actualizar(tarea: Tarea): Promise<Tarea> {
    const orm = TareaMapper.toOrm(tarea);
    const updated = await this.ormRepository.save(orm);
    return TareaMapper.toDomain(updated);
  }

  /**
   * Deletes a task by its ID.
   * @param idTarea - The ID of the task to delete
   */
  async eliminar(idTarea: number): Promise<void> {
    await this.ormRepository.delete({ id: idTarea });
  }

  /**
   * Retrieves all tasks with PENDIENTE status.
   * @returns An array of pending Tarea entities
   */
  async obtenerPendientes(): Promise<Tarea[]> {
    const orms = await this.ormRepository.find({
      where: { status: 'PENDIENTE' },
      order: { dueDate: 'ASC' },
    });
    return orms.map(TareaMapper.toDomain);
  }

  /**
   * Retrieves all tasks with a specific status.
   * @param estado - The status to filter by
   * @returns An array of Tarea entities with the specified status
   */
  async obtenerPorEstado(estado: string): Promise<Tarea[]> {
    const orms = await this.ormRepository.find({
      where: { status: estado },
      order: { createdAt: 'DESC' },
    });
    return orms.map(TareaMapper.toDomain);
  }
}
