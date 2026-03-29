import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/entrega.entity';
import {
  IDeliveryRepository,
  DELIVERY_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/entrega.repository.port';
import { RegisterExitUseCase } from '../../../inventario/application/use-cases/registrar-salida.use-case';
import { TransactionService } from '../../../../shared/infrastructure/database/transaction.service';

/**
 * Use case responsible for confirming a delivery AND automatically decrementing
 * the inventory stock for all items in the delivery.
 *
 * Workflow:
 * 1. Find the delivery by ID
 * 2. Verify it's in IN_TRANSIT status (ready to be delivered)
 * 3. For EACH item in the delivery: decrement stock from warehouse (default ID: 1)
 * 4. If ANY stock decrement fails, ROLLBACK entire operation (all-or-nothing)
 * 5. Update delivery status to DELIVERED
 * 6. Persist updated delivery
 *
 * BUSINESS RULE (RF05): Cuando se confirma una entrega, el stock del inventario
 * debe decrementarse automáticamente. Si no hay stock suficiente, la entrega
 * no se puede confirmar.
 */
@Injectable()
export class ConfirmDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly registerExitUseCase: RegisterExitUseCase,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Executes the delivery confirmation process with automatic stock decrement.
   * Uses database transaction to ensure atomicity:
   * - If all stock decrements succeed: commit delivery confirmation + inventory updates
   * - If any stock decrement fails: rollback everything (delivery stays IN_TRANSIT)
   *
   * @param deliveryId - The ID of the delivery to confirm
   * @returns A Result containing the confirmed Delivery on success,
   *          or an error message if validation fails or stock is insufficient
   */
  async execute(deliveryId: number): Promise<Result<Delivery>> {
    // PASO 0: Pre-validar la entrega ANTES de la transacción (lectura no transaccional)
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      return err(`Delivery with ID ${deliveryId} not found`);
    }

    // Validar que la entrega está en estado IN_TRANSIT
    try {
      delivery.confirmDelivery(); // Cambia estado a DELIVERED
    } catch (error) {
      return err(
        error instanceof Error ? error.message : 'Failed to confirm delivery',
      );
    }

    // TRANSACCION: Dentro de una transacción, decrementar stock Y guardar entrega confirmada
    // Si algo falla en el medio, TODO se revierte (incluyendo los cambios de stock)
    try {
      await this.transactionService.executeInTransaction(async () => {
        // PASO 1: Decrementar stock automáticamente para CADA producto en la entrega
        const DEFAULT_WAREHOUSE_ID = 1;

        for (const item of delivery.items) {
          // Intentar decrementar el stock para este producto
          const stockResult = await this.registerExitUseCase.execute(
            item.productId,
            DEFAULT_WAREHOUSE_ID,
            item.quantity,
          );

          // Si el decremento de stock falla (ej: stock insuficiente), lanzar excepción
          // Esto causará un rollback automático de la transacción
          if (!stockResult.success) {
            throw new Error(
              `Cannot confirm delivery: stock decrement failed for product ${item.productId}. ` +
              `Error: ${stockResult.error}`,
            );
          }
        }

        // PASO 2: Si todos los decrementos de stock fueron exitosos,
        // persistir la entrega confirmada (dentro de la misma transacción)
        await this.deliveryRepository.save(delivery);
      });

      // Si la transacción completó sin errores, retornar la entrega confirmada
      return ok(delivery);
    } catch (error) {
      // Si algo falló en la transacción, revertir el estado de la entrega
      // (la transacción ya hizo rollback en la base de datos)
      delivery.status = 'IN_TRANSIT'; // Revertir cambio de estado

      return err(
        error instanceof Error
          ? error.message
          : 'Delivery confirmation failed due to transaction error',
      );
    }
  }
}
