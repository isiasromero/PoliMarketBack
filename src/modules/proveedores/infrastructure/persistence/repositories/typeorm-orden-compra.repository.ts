import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../../../domain/entities/orden-compra.entity';
import { IPurchaseOrderRepository } from '../../../domain/ports/outbound/orden-compra.repository.port';
import { PurchaseOrderOrmEntity } from '../entities/orden-compra.orm-entity';
import { PurchaseOrderMapper } from '../mappers/orden-compra.mapper';

/**
 * TypeORM-based implementation of the IPurchaseOrderRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 * Handles cascade persistence of order details and eager loading on queries.
 */
@Injectable()
export class TypeOrmPurchaseOrderRepository
  implements IPurchaseOrderRepository
{
  constructor(
    @InjectRepository(PurchaseOrderOrmEntity)
    private readonly ormRepository: Repository<PurchaseOrderOrmEntity>,
  ) {}

  /**
   * Persists a PurchaseOrder domain entity along with its details to the database.
   * Uses TypeORM cascade to save details automatically.
   * @param order - The PurchaseOrder domain entity to save, including details
   * @returns The saved PurchaseOrder with generated/updated fields and persisted details
   */
  async save(order: PurchaseOrder): Promise<PurchaseOrder> {
    const orm = PurchaseOrderMapper.toOrm(order);
    const saved = await this.ormRepository.save(orm);
    return PurchaseOrderMapper.toDomain(saved);
  }

  /**
   * Finds a purchase order by its unique identifier, including its details and supplier info.
   * Details and supplier are eager-loaded via the ORM relationship configuration.
   * @param id - The purchase order ID to search for
   * @returns The found PurchaseOrder domain entity with details and supplier name or null
   */
  async findById(id: number): Promise<PurchaseOrder | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: ['details', 'supplier'],
    });
    return orm ? PurchaseOrderMapper.toDomain(orm) : null;
  }

  /**
   * Finds all purchase orders placed with a specific supplier, including details and supplier info.
   * @param supplierId - The ID of the supplier to filter by
   * @returns An array of PurchaseOrder domain entities with details and supplier name
   */
  async findBySupplier(supplierId: number): Promise<PurchaseOrder[]> {
    const orms = await this.ormRepository.find({
      where: { supplierId },
      relations: ['details', 'supplier'],
    });
    return orms.map(PurchaseOrderMapper.toDomain);
  }

  /**
   * Retrieves all purchase orders from the database, including their details and supplier info.
   * @returns An array of all PurchaseOrder domain entities with details and supplier name
   */
  async findAll(): Promise<PurchaseOrder[]> {
    const orms = await this.ormRepository.find({
      relations: ['details', 'supplier'],
    });
    return orms.map(PurchaseOrderMapper.toDomain);
  }

  /**
   * Deletes a purchase order by its ID.
   * Cascade delete handles removal of order details automatically.
   * @param id - The purchase order ID to delete
   * @returns True if deleted successfully, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
