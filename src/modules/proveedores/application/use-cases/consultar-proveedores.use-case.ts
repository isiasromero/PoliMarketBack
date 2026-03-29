import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Supplier } from '../../domain/entities/proveedor.entity';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/proveedor.repository.port';

/**
 * Use case responsible for retrieving all suppliers registered in the system.
 * Returns the full list of Supplier domain entities.
 */
@Injectable()
export class GetSuppliersUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the supplier listing operation.
   * @returns A Result containing an array of all Supplier entities
   */
  async execute(): Promise<Result<Supplier[]>> {
    const suppliers = await this.supplierRepository.findAll();
    return ok(suppliers);
  }
}
