import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * Domain entity representing an HR (Human Resources) employee.
 * HR employees are responsible for managing seller authorizations
 * across the different systems within the PoliMarket platform.
 */
export class HREmployee extends BaseEntity {
  /** Full name of the HR employee */
  name!: string;

  /** Job position or role within the HR department */
  position!: string;

  /** Corporate email address of the HR employee */
  email!: string;
}
