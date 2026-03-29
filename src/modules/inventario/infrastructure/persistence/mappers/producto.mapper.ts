import { Product } from '../../../domain/entities/producto.entity';
import { ProductOrmEntity } from '../entities/producto.orm-entity';

/**
 * Mapper class responsible for converting between the Product domain entity
 * and the ProductOrmEntity persistence model.
 * Ensures a clean separation between the domain and infrastructure layers.
 */
export class ProductMapper {
  /**
   * Converts a ProductOrmEntity (persistence) to a Product (domain).
   * @param ormEntity - The TypeORM entity to convert
   * @returns A Product domain entity
   */
  static toDomain(ormEntity: ProductOrmEntity): Product {
    return new Product({
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      unitPrice: Number(ormEntity.unitPrice),
      category: ormEntity.category,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * Converts a Product (domain) to a ProductOrmEntity (persistence).
   * @param domain - The domain entity to convert
   * @returns A ProductOrmEntity ready for persistence
   */
  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.description = domain.description;
    orm.unitPrice = domain.unitPrice;
    orm.category = domain.category;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      orm.updatedAt = domain.updatedAt;
    }
    return orm;
  }
}
