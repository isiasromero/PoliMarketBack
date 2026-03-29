import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../../domain/entities/proveedor.entity';
import { ISupplierRepository } from '../../../domain/ports/outbound/proveedor.repository.port';
import { SupplierOrmEntity } from '../entities/proveedor.orm-entity';
import { SupplierMapper } from '../mappers/proveedor.mapper';

/**
 * TypeORM-based implementation of the ISupplierRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 */
@Injectable()
export class TypeOrmSupplierRepository implements ISupplierRepository {
  constructor(
    @InjectRepository(SupplierOrmEntity)
    private readonly ormRepository: Repository<SupplierOrmEntity>,
  ) {}

  /**
   * Persists a Supplier domain entity to the database.
   * @param supplier - The Supplier domain entity to save
   * @returns The saved Supplier with generated/updated fields
   */
  async save(supplier: Supplier): Promise<Supplier> {
    const orm = SupplierMapper.toOrm(supplier);
    const saved = await this.ormRepository.save(orm);
    return SupplierMapper.toDomain(saved);
  }

  /**
   * Finds a supplier by its unique identifier.
   * @param id - The supplier ID to search for
   * @returns The found Supplier domain entity or null
   */
  async findById(id: number): Promise<Supplier | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? SupplierMapper.toDomain(orm) : null;
  }

  /**
   * Retrieves all suppliers from the database.
   * @returns An array of all Supplier domain entities
   */
  async findAll(): Promise<Supplier[]> {
    const orms = await this.ormRepository.find();
    return orms.map(SupplierMapper.toDomain);
  }

  /**
   * Deletes a supplier from the database by its ID.
   * @param id - The supplier ID to delete
   * @returns true if deletion was successful, false if supplier not found
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete({ id });
    return result.affected ? result.affected > 0 : false;
  }
}
