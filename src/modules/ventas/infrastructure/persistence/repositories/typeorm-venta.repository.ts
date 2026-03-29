import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../../../domain/entities/venta.entity';
import { ISaleRepository } from '../../../domain/ports/outbound/venta.repository.port';
import { SaleOrmEntity } from '../entities/venta.orm-entity';
import { SaleMapper } from '../mappers/venta.mapper';

/**
 * TypeORM-based implementation of the ISaleRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 * Handles cascade persistence of sale details and eager loading on queries.
 */
@Injectable()
export class TypeOrmSaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleOrmEntity)
    private readonly ormRepository: Repository<SaleOrmEntity>,
  ) {}

  /**
   * Persists a Sale domain entity along with its details to the database.
   * Uses TypeORM cascade to save details automatically.
   * @param sale - The Sale domain entity to save, including details
   * @returns The saved Sale with generated/updated fields and persisted details
   */
  async save(sale: Sale): Promise<Sale> {
    const orm = SaleMapper.toOrm(sale);
    const saved = await this.ormRepository.save(orm);
    return SaleMapper.toDomain(saved);
  }

  /**
   * Finds a sale by its unique identifier, including its details.
   * Details are eager-loaded via the ORM relationship configuration.
   * @param id - The sale ID to search for
   * @returns The found Sale domain entity with details or null
   */
  async findById(id: number): Promise<Sale | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: ['details'],
    });
    return orm ? SaleMapper.toDomain(orm) : null;
  }

  /**
   * Finds all sales made by a specific seller, including details.
   * @param sellerId - The ID of the seller to filter by
   * @returns An array of Sale domain entities with details
   */
  async findBySeller(sellerId: number): Promise<Sale[]> {
    const orms = await this.ormRepository.find({
      where: { sellerId },
      relations: ['details'],
    });
    return orms.map(SaleMapper.toDomain);
  }

  /**
   * Retrieves all sales from the database, including their details.
   * @returns An array of all Sale domain entities with details
   */
  async findAll(): Promise<Sale[]> {
    const orms = await this.ormRepository.find({
      relations: ['details'],
    });
    return orms.map(SaleMapper.toDomain);
  }
}
