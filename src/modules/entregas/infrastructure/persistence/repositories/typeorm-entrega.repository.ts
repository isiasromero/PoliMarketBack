import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Delivery } from '../../../domain/entities/entrega.entity';
import { IDeliveryRepository } from '../../../domain/ports/outbound/entrega.repository.port';
import { DeliveryOrmEntity } from '../entities/entrega.orm-entity';
import { DeliveryMapper } from '../mappers/entrega.mapper';

/**
 * TypeORM-based implementation of the IDeliveryRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 * Handles cascade persistence of delivery items and eager loading on queries.
 */
@Injectable()
export class TypeOrmDeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly ormRepository: Repository<DeliveryOrmEntity>,
  ) {}

  /**
   * Persists a Delivery domain entity along with its items to the database.
   * Uses TypeORM cascade to save items automatically.
   * @param delivery - The Delivery domain entity to save, including items
   * @returns The saved Delivery with generated/updated fields and persisted items
   */
  async save(delivery: Delivery): Promise<Delivery> {
    const orm = DeliveryMapper.toOrm(delivery);
    const saved = await this.ormRepository.save(orm);
    return DeliveryMapper.toDomain(saved);
  }

  /**
   * Finds a delivery by its unique identifier, including its items.
   * Items are eager-loaded via the ORM relationship configuration.
   * @param id - The delivery ID to search for
   * @returns The found Delivery domain entity with items or null
   */
  async findById(id: number): Promise<Delivery | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    return orm ? DeliveryMapper.toDomain(orm) : null;
  }

  /**
   * Finds all deliveries associated with a specific sale, including items.
   * @param saleId - The ID of the sale to filter by
   * @returns An array of Delivery domain entities belonging to the sale
   */
  async findBySale(saleId: number): Promise<Delivery[]> {
    const orms = await this.ormRepository.find({
      where: { saleId },
      relations: ['items'],
    });
    return orms.map(DeliveryMapper.toDomain);
  }

  /**
   * Finds all deliveries with status PENDING or IN_TRANSIT, including items.
   * Useful for tracking active deliveries that have not yet been completed.
   * @returns An array of Delivery entities that are still pending or in transit
   */
  async findPending(): Promise<Delivery[]> {
    const orms = await this.ormRepository.find({
      where: { status: In(['PENDING', 'IN_TRANSIT']) },
      relations: ['items'],
    });
    return orms.map(DeliveryMapper.toDomain);
  }

  /**
   * Retrieves all deliveries from the database, including their items.
   * @returns An array of all Delivery domain entities with items
   */
  async findAll(): Promise<Delivery[]> {
    const orms = await this.ormRepository.find({
      relations: ['items'],
    });
    return orms.map(DeliveryMapper.toDomain);
  }
}
