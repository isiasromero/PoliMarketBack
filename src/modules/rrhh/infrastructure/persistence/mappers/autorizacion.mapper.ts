import { Authorization, AuthorizationStatus } from '../../../domain/entities/autorizacion.entity';
import { AuthorizationOrmEntity } from '../entities/autorizacion.orm-entity';

/**
 * Mapper responsible for converting between the Authorization domain entity
 * and the AuthorizationOrmEntity persistence entity.
 * Ensures the domain layer remains independent of TypeORM.
 */
export class AuthorizationMapper {
  /**
   * Converts a TypeORM ORM entity into a domain entity.
   * @param orm - The ORM entity retrieved from the database
   * @returns A domain Authorization entity
   */
  static toDomain(orm: AuthorizationOrmEntity): Authorization {
    const authorization = new Authorization();
    authorization.id = orm.id;
    authorization.employeeId = orm.employeeId;
    authorization.sellerId = orm.sellerId;
    authorization.targetSystem = orm.targetSystem;
    authorization.authorizationDate = orm.authorizationDate;
    authorization.status = orm.status as AuthorizationStatus;
    authorization.createdAt = orm.createdAt;
    authorization.updatedAt = orm.updatedAt;
    return authorization;
  }

  /**
   * Converts a domain entity into a TypeORM ORM entity for persistence.
   * @param domain - The domain Authorization entity
   * @returns A TypeORM ORM entity ready for saving
   */
  static toOrm(domain: Authorization): AuthorizationOrmEntity {
    const orm = new AuthorizationOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.employeeId = domain.employeeId;
    orm.sellerId = domain.sellerId;
    orm.targetSystem = domain.targetSystem;
    orm.authorizationDate = domain.authorizationDate;
    orm.status = domain.status;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      orm.updatedAt = domain.updatedAt;
    }
    return orm;
  }
}
