import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../../../domain/entities/vendedor.entity';
import { ISellerRepository } from '../../../domain/ports/outbound/vendedor.repository.port';
import { SellerOrmEntity } from '../entities/vendedor.orm-entity';
import { SellerMapper } from '../mappers/vendedor.mapper';

/**
 * TypeORM-based implementation of the ISellerRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 */
@Injectable()
export class TypeOrmSellerRepository implements ISellerRepository {
  constructor(
    @InjectRepository(SellerOrmEntity)
    private readonly ormRepository: Repository<SellerOrmEntity>,
  ) {}

  /**
   * Persists a Seller domain entity to the database.
   * @param seller - The Seller domain entity to save
   * @returns The saved Seller with generated/updated fields
   */
  async save(seller: Seller): Promise<Seller> {
    const orm = SellerMapper.toOrm(seller);
    const saved = await this.ormRepository.save(orm);
    return SellerMapper.toDomain(saved);
  }

  /**
   * Finds a seller by its unique identifier.
   * @param id - The seller ID to search for
   * @returns The found Seller domain entity or null
   */
  async findById(id: number): Promise<Seller | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? SellerMapper.toDomain(orm) : null;
  }

  /**
   * Retrieves all sellers from the database.
   * @returns An array of Seller domain entities
   */
  async findAll(): Promise<Seller[]> {
    const orms = await this.ormRepository.find();
    return orms.map(SellerMapper.toDomain);
  }
}
