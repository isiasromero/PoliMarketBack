import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../../domain/entities/bodega.entity';
import { IWarehouseRepository } from '../../../domain/ports/outbound/bodega.repository.port';
import { WarehouseOrmEntity } from '../entities/bodega.orm-entity';
import { WarehouseMapper } from '../mappers/bodega.mapper';

/**
 * TypeORM-based implementation of the IWarehouseRepository port.
 * Handles persistence operations for Warehouse entities using SQLite via TypeORM.
 */
@Injectable()
export class TypeOrmWarehouseRepository implements IWarehouseRepository {
  constructor(
    @InjectRepository(WarehouseOrmEntity)
    private readonly ormRepository: Repository<WarehouseOrmEntity>,
  ) {}

  /**
   * Persists a Warehouse domain entity to the database.
   * @param warehouse - The Warehouse domain entity to save
   * @returns The saved Warehouse with generated/updated fields
   */
  async save(warehouse: Warehouse): Promise<Warehouse> {
    const ormEntity = WarehouseMapper.toOrm(warehouse);
    const saved = await this.ormRepository.save(ormEntity);
    return WarehouseMapper.toDomain(saved);
  }

  /**
   * Finds a Warehouse by its unique identifier.
   * @param id - The warehouse ID to search for
   * @returns The found Warehouse domain entity or null
   */
  async findById(id: number): Promise<Warehouse | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) {
      return null;
    }
    return WarehouseMapper.toDomain(ormEntity);
  }

  /**
   * Retrieves all Warehouses from the database.
   * @returns An array of all Warehouse domain entities
   */
  async findAll(): Promise<Warehouse[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map(WarehouseMapper.toDomain);
  }
}
