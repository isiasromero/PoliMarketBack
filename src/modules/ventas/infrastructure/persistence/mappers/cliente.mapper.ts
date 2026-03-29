import { Client } from '../../../domain/entities/cliente.entity';
import { ClientOrmEntity } from '../entities/cliente.orm-entity';

/**
 * Mapper responsible for converting between the Client domain entity
 * and the ClientOrmEntity persistence model.
 * Keeps the domain layer decoupled from TypeORM infrastructure.
 */
export class ClientMapper {
  /**
   * Converts a ClientOrmEntity (persistence) to a Client (domain).
   * @param orm - The TypeORM entity to convert
   * @returns A Client domain entity
   */
  static toDomain(orm: ClientOrmEntity): Client {
    return new Client({
      id: orm.id,
      name: orm.name,
      address: orm.address,
      phone: orm.phone,
      identification: orm.identification,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a Client (domain) to a ClientOrmEntity (persistence).
   * @param domain - The domain entity to convert
   * @returns A ClientOrmEntity ready for TypeORM operations
   */
  static toOrm(domain: Client): ClientOrmEntity {
    const orm = new ClientOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.address = domain.address;
    orm.phone = domain.phone;
    orm.identification = domain.identification;
    return orm;
  }
}
