import { Seller } from '../../../domain/entities/vendedor.entity';
import { SellerOrmEntity } from '../entities/vendedor.orm-entity';

/**
 * Mapper responsible for converting between the Seller domain entity
 * and the SellerOrmEntity persistence model.
 * Keeps the domain layer decoupled from TypeORM infrastructure.
 */
export class SellerMapper {
  /**
   * Converts a SellerOrmEntity (persistence) to a Seller (domain).
   * @param orm - The TypeORM entity to convert
   * @returns A Seller domain entity
   */
  static toDomain(orm: SellerOrmEntity): Seller {
    return new Seller({
      id: orm.id,
      name: orm.name,
      identification: orm.identification,
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a Seller (domain) to a SellerOrmEntity (persistence).
   * @param domain - The domain entity to convert
   * @returns A SellerOrmEntity ready for TypeORM operations
   */
  static toOrm(domain: Seller): SellerOrmEntity {
    const orm = new SellerOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.identification = domain.identification;
    orm.active = domain.active;
    return orm;
  }
}
