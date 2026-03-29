import { HREmployee } from '../../entities/empleado-rrhh.entity';

/**
 * Symbol token for dependency injection of the HR employee repository.
 */
export const HR_EMPLOYEE_REPOSITORY_TOKEN = Symbol('HR_EMPLOYEE_REPOSITORY_TOKEN');

/**
 * Outbound port defining the persistence contract for HR employee entities.
 * Infrastructure adapters must implement this interface to provide
 * data access for HR employees.
 */
export interface IHREmployeeRepository {
  /**
   * Persists an HR employee entity (create or update).
   * @param employee - The HR employee entity to save
   * @returns The saved HR employee with generated/updated fields
   */
  save(employee: HREmployee): Promise<HREmployee>;

  /**
   * Finds an HR employee by their unique identifier.
   * @param id - The unique ID of the HR employee
   * @returns The found HR employee, or null if not found
   */
  findById(id: number): Promise<HREmployee | null>;

  /**
   * Retrieves all HR employees from the repository.
   * @returns An array of all HR employee entities
   */
  findAll(): Promise<HREmployee[]>;
}
