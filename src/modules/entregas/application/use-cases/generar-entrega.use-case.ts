import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err, esFallo } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/entrega.entity';
import { DeliveryItem } from '../../domain/entities/entrega-item.entity';
import {
  IDeliveryRepository,
  DELIVERY_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/entrega.repository.port';
import {
  ISaleRepository,
  SALE_REPOSITORY_TOKEN,
} from '../../../ventas/domain/ports/outbound/venta.repository.port';
import { VerifySufficientStockUseCase } from '../../../inventario/application/use-cases/verificar-stock-suficiente.use-case';

/** Detail line item within the delivery generation input */
export interface GenerateDeliveryItemInput {
  /** ID of the product to deliver */
  productId: number;
  /** Number of units to deliver */
  quantity: number;
}

/** Input DTO for the generate delivery use case */
export interface GenerateDeliveryInput {
  /** ID of the sale that originated this delivery */
  saleId: number;
  /** Physical address where the delivery should be sent */
  destinationAddress: string;
  /** Line items included in the delivery */
  items: GenerateDeliveryItemInput[];
}

/**
 * Use case responsible for generating a new delivery in the system.
 * Creates a Delivery with status PENDING and the provided items,
 * then persists it through the repository.
 */
@Injectable()
export class GenerateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
    @Inject(SALE_REPOSITORY_TOKEN)
    private readonly saleRepository: ISaleRepository,
    private readonly verifySufficientStockUseCase: VerifySufficientStockUseCase,
  ) {}

  /**
   * Executes the delivery generation process.
   * Validates that the sale exists and that sufficient stock is available for each item.
   * @param input - The sale ID, destination address, and array of item details
   * @returns A Result containing the persisted Delivery on success,
   *          or an error message if validation fails
   */
  async execute(input: GenerateDeliveryInput): Promise<Result<Delivery>> {
    if (!input.items || input.items.length === 0) {
      return err('A delivery must have at least one item');
    }

    if (!input.destinationAddress || input.destinationAddress.trim() === '') {
      return err('Destination address is required');
    }

    // Validate that the sale exists
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      return err(`Sale with ID ${input.saleId} does not exist`);
    }

    // VALIDACIÓN RF05: Verificar que la venta tenga estado CONFIRMED antes de generar entrega
    if (sale.status !== 'CONFIRMED') {
      return err(
        `Cannot generate delivery: sale with ID ${input.saleId} has status '${sale.status}'. Only sales with status 'CONFIRMED' can generate deliveries.`,
      );
    }

    // VALIDACIÓN RF05: Verificar que no exista una entrega previa para la misma venta (evitar duplicados)
    const existingDeliveries = await this.deliveryRepository.findBySale(input.saleId);
    if (existingDeliveries && existingDeliveries.length > 0) {
      return err(
        `Cannot generate delivery: sale with ID ${input.saleId} already has an existing delivery.`,
      );
    }

    // Validate that there is sufficient stock for each item
    for (const item of input.items) {
      const stockResult = await this.verifySufficientStockUseCase.execute(
        item.productId,
        item.quantity,
      );

      if (esFallo(stockResult)) {
        return err(stockResult.error);
      }

      const hasSufficientStock = stockResult.value;
      if (!hasSufficientStock) {
        return err(
          `Insufficient stock for product ID ${item.productId}. Required: ${item.quantity}`,
        );
      }
    }

    const items = input.items.map(
      (item) =>
        new DeliveryItem({
          productId: item.productId,
          quantity: item.quantity,
        }),
    );

    const delivery = new Delivery({
      saleId: input.saleId,
      destinationAddress: input.destinationAddress,
      status: 'PENDING',
      deliveryDate: new Date(),
      items,
    });

    const saved = await this.deliveryRepository.save(delivery);
    return ok(saved);
  }
}
