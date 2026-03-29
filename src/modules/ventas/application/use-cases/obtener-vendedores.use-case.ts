import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Seller } from '../../domain/entities/vendedor.entity';
import {
  ISellerRepository,
  SELLER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/vendedor.repository.port';

/**
 * Use case for retrieving all sellers from the sales module.
 * Returns a complete list of all Seller entities in the system.
 */
@Injectable()
export class ObtenerVendedoresUseCase {
  constructor(
    @Inject(SELLER_REPOSITORY_TOKEN)
    private readonly sellerRepository: ISellerRepository,
  ) {}

  /**
   * Executes the retrieval of all sellers.
   * @returns A Result containing an array of all Seller entities
   */
  async execute(): Promise<Result<Seller[]>> {
    const sellers = await this.sellerRepository.findAll();
    return ok(sellers);
  }
}
