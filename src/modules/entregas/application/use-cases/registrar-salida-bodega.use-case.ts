import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/entrega.entity';
import {
  IDeliveryRepository,
  DELIVERY_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/entrega.repository.port';

/**
 * Use case responsible for registering a warehouse exit for a delivery.
 * Finds the delivery by ID, transitions its status from PENDING to IN_TRANSIT,
 * and persists the updated entity. This represents the moment
 * the shipment physically leaves the warehouse.
 */
@Injectable()
export class RegisterWarehouseExitUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  /**
   * Executes the warehouse exit registration process.
   * @param deliveryId - The ID of the delivery leaving the warehouse
   * @returns A Result containing the updated Delivery on success,
   *          or an error message if the delivery is not found or cannot transit
   */
  async execute(deliveryId: number): Promise<Result<Delivery>> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      return err(`Delivery with ID ${deliveryId} not found`);
    }

    try {
      delivery.markInTransit();
    } catch (error) {
      return err(
        error instanceof Error
          ? error.message
          : 'Failed to mark delivery as in transit',
      );
    }

    const saved = await this.deliveryRepository.save(delivery);
    return ok(saved);
  }
}
