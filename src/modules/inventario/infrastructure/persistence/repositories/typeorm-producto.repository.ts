import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../domain/entities/producto.entity';
import { IProductRepository } from '../../../domain/ports/outbound/producto.repository.port';
import { ProductOrmEntity } from '../entities/producto.orm-entity';
import { ProductMapper } from '../mappers/producto.mapper';

/**
 * TypeORM-based implementation of the IProductRepository port.
 * Handles persistence operations for Product entities using SQLite via TypeORM.
 */
@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
  ) {}

  /**
   * Persists a Product domain entity to the database.
   * @param product - The Product domain entity to save
   * @returns The saved Product with generated/updated fields
   */
  async save(product: Product): Promise<Product> {
    const ormEntity = ProductMapper.toOrm(product);
    const saved = await this.ormRepository.save(ormEntity);
    return ProductMapper.toDomain(saved);
  }

  /**
   * Finds a Product by its unique identifier.
   * @param id - The product ID to search for
   * @returns The found Product domain entity or null
   */
  async findById(id: number): Promise<Product | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) {
      return null;
    }
    return ProductMapper.toDomain(ormEntity);
  }

  /**
   * Retrieves all Products from the database.
   * @returns An array of all Product domain entities
   */
  async findAll(): Promise<Product[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map(ProductMapper.toDomain);
  }

  /**
   * Deletes a product from the database by its ID.
   * @param id - The product ID to delete
   * @returns true if deletion was successful, false if product not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete({ id });
    return result.affected ? result.affected > 0 : false;
  }
}
