import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Sale } from '../../domain/entities/venta.entity';
import {
  ISaleRepository,
  SALE_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/venta.repository.port';
import {
  ISellerRepository,
  SELLER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/vendedor.repository.port';

/**
 * Use case responsible for retrieving all sales made by a specific seller.
 * Validates that the seller exists before querying their sales.
 */
@Injectable()
export class GetSalesBySellerUseCase {
  constructor(
    @Inject(SALE_REPOSITORY_TOKEN)
    private readonly saleRepository: ISaleRepository,
    @Inject(SELLER_REPOSITORY_TOKEN)
    private readonly sellerRepository: ISellerRepository,
  ) {}

  /**
   * Executes the sales-by-seller query.
   * @param sellerId - The ID of the seller whose sales to retrieve
   * @returns A Result containing an array of Sale entities for the seller,
   *          or an error message if the seller is not found
   */
  async execute(sellerId: number): Promise<Result<Sale[]>> {
    const seller = await this.sellerRepository.findById(sellerId);
    if (!seller) {
      return err(`Seller with ID ${sellerId} not found`);
    }

    const sales = await this.saleRepository.findBySeller(sellerId);
    return ok(sales);
  }
}
