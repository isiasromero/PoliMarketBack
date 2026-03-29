import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { StockProduct } from '../../../domain/entities/stock-producto.entity';
import { IStockProductRepository } from '../../../domain/ports/outbound/stock-producto.repository.port';
import { StockProductOrmEntity } from '../entities/stock-producto.orm-entity';
import { StockProductMapper } from '../mappers/stock-producto.mapper';

/**
 * TypeORM-based implementation of the IStockProductRepository port.
 * Handles persistence operations for StockProduct entities using SQLite via TypeORM.
 */
@Injectable()
export class TypeOrmStockProductRepository implements IStockProductRepository {
  constructor(
    @InjectRepository(StockProductOrmEntity)
    private readonly ormRepository: Repository<StockProductOrmEntity>,
  ) {}

  /**
   * Persists a StockProduct domain entity to the database.
   * @param stockProduct - The StockProduct domain entity to save
   * @returns The saved StockProduct with generated/updated fields
   */
  async save(stockProduct: StockProduct): Promise<StockProduct> {
    const ormEntity = StockProductMapper.toOrm(stockProduct);
    const saved = await this.ormRepository.save(ormEntity);
    return StockProductMapper.toDomain(saved);
  }

  /**
   * Finds the stock record for a specific product in a specific warehouse.
   * @param productId - The product ID to search for
   * @param warehouseId - The warehouse ID to search for
   * @returns The found StockProduct domain entity or null
   */
  async findByProductAndWarehouse(
    productId: number,
    warehouseId: number,
  ): Promise<StockProduct | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { productId, warehouseId },
    });
    if (!ormEntity) {
      return null;
    }
    return StockProductMapper.toDomain(ormEntity);
  }

  /**
   * Finds all stock records for a given warehouse.
   * @param warehouseId - The warehouse ID to filter by
   * @returns An array of StockProduct domain entities in the specified warehouse
   */
  async findByWarehouse(warehouseId: number): Promise<StockProduct[]> {
    const ormEntities = await this.ormRepository.find({
      where: { warehouseId },
    });
    return ormEntities.map(StockProductMapper.toDomain);
  }

  /**
   * Retrieves all StockProduct records from the database.
   * @returns An array of all StockProduct domain entities
   */
  async findAll(): Promise<StockProduct[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map(StockProductMapper.toDomain);
  }

  /**
   * Finds all stock products where available quantity is at or below minimum quantity.
   * Uses a raw SQL approach with TypeORM's query builder to compare two columns.
   * @returns An array of StockProduct domain entities that need restocking
   */
  async findBelowMinimum(): Promise<StockProduct[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder('sp')
      .where('sp.available_quantity <= sp.minimum_quantity')
      .getMany();
    return ormEntities.map(StockProductMapper.toDomain);
  }
}
