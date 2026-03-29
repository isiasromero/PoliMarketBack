import { HREmployee } from '../../../domain/entities/empleado-rrhh.entity';
import { HREmployeeOrmEntity } from '../entities/empleado-rrhh.orm-entity';

/**
 * Mapper responsible for converting between the HREmployee domain entity
 * and the HREmployeeOrmEntity persistence entity.
 * Ensures the domain layer remains independent of TypeORM.
 */
export class HREmployeeMapper {
  /**
   * Converts a TypeORM ORM entity into a domain entity.
   * @param orm - The ORM entity retrieved from the database
   * @returns A domain HREmployee entity
   */
  static toDomain(orm: HREmployeeOrmEntity): HREmployee {
    const employee = new HREmployee();
    employee.id = orm.id;
    employee.name = orm.name;
    employee.position = orm.position;
    employee.email = orm.email;
    employee.createdAt = orm.createdAt;
    employee.updatedAt = orm.updatedAt;
    return employee;
  }

  /**
   * Converts a domain entity into a TypeORM ORM entity for persistence.
   * @param domain - The domain HREmployee entity
   * @returns A TypeORM ORM entity ready for saving
   */
  static toOrm(domain: HREmployee): HREmployeeOrmEntity {
    const orm = new HREmployeeOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.position = domain.position;
    orm.email = domain.email;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      orm.updatedAt = domain.updatedAt;
    }
    return orm;
  }
}
