import { Supplier } from '../../../domain/entities/proveedor.entity';
import { SupplierOrmEntity } from '../entities/proveedor.orm-entity';

/**
 * Mapper responsible for converting between the Supplier domain entity
 * and its corresponding TypeORM persistence model.
 */
export class SupplierMapper {
  /**
   * Converts a SupplierOrmEntity (persistence) to a Supplier (domain).
   * @param orm - The TypeORM supplier entity to convert
   * @returns A Supplier domain entity
   */
  static toDomain(orm: SupplierOrmEntity): Supplier {
    return new Supplier({
      id: orm.id,
      name: orm.name,
      contact: orm.contact,
      phone: orm.phone,
      email: orm.email,
      address: orm.address,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a Supplier (domain) to a SupplierOrmEntity (persistence).
   * @param domain - The domain supplier entity to convert
   * @returns A SupplierOrmEntity ready for TypeORM operations
   */
  static toOrm(domain: Supplier): SupplierOrmEntity {
    const orm = new SupplierOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.contact = domain.contact;
    orm.phone = domain.phone;
    orm.email = domain.email;
    orm.address = domain.address;
    return orm;
  }
}
