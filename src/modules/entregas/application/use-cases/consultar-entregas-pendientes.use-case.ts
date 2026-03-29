import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/entrega.entity';
import {
  IDeliveryRepository,
  DELIVERY_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/entrega.repository.port';

/**
 * Use case responsible for retrieving all pending deliveries.
 * Returns all deliveries with status PENDING or IN_TRANSIT,
 * which represent active shipments that have not yet been completed.
 */
@Injectable()
export class GetPendingDeliveriesUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  /**
   * Executes the pending deliveries query.
   * @returns A Result containing an array of Delivery entities
   *          with status PENDING or IN_TRANSIT
   */
  async execute(): Promise<Result<Delivery[]>> {
    const deliveries = await this.deliveryRepository.findPending();
    return ok(deliveries);
  }
}
