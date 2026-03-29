import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

/**
 * Servicio para gestionar transacciones de base de datos en todo el sistema.
 *
 * IMPORTANCIA: Las transacciones garantizan consistencia de datos cuando múltiples
 * operaciones deben ejecutarse como una unidad atómica: o todas succeed o todas fail.
 *
 * CASOS DE USO EN POLIMARKET:
 * 1. ConfirmDelivery: decrementar stock DEBE ser atómico con actualizar estado entrega
 * 2. RegisterSale: crear venta + crear detalles DEBEN ser juntos
 * 3. AutoGeneratePurchaseOrder: crear orden DEBE ser atómico con actualizar estado stock
 *
 * PATRÓN: Usar executeInTransaction() para envolver operaciones complejas
 *
 * @example
 * const result = await this.transactionService.executeInTransaction(
 *   async (queryRunner) => {
 *     // Decrementar stock
 *     await stockRepo.save(...);
 *     // Crear orden de compra
 *     await orderRepo.save(...);
 *     // Si ambas succeed, commit. Si alguna falla, rollback ambas.
 *     return { success: true };
 *   }
 * );
 */
@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Ejecuta un bloque de código dentro de una transacción.
   *
   * Si la función completa exitosamente, los cambios se commitean.
   * Si alguna operación falla, se hace rollback de todos los cambios.
   *
   * @param work - Función que contiene la lógica transaccional
   * @returns El resultado retornado por la función work
   *
   * @example
   * const result = await transactionService.executeInTransaction(
   *   async (queryRunner) => {
   *     const repo = queryRunner.manager.getRepository(Product);
   *     const product = await repo.findOne(123);
   *     product.stock--;
   *     await repo.save(product);
   *     return { updated: true };
   *   }
   * );
   */
  async executeInTransaction<T>(
    work: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    // Iniciar transacción
    await queryRunner.startTransaction();

    try {
      // Ejecutar la lógica de negocio dentro de la transacción
      const result = await work(queryRunner);

      // Si todo va bien, commitear la transacción
      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      // Si algo falla, hacer rollback de todos los cambios
      await queryRunner.rollbackTransaction();

      // Re-lanzar el error para que sea manejado por el caller
      throw error;
    } finally {
      // Siempre liberar la conexión (importante para pool de conexiones)
      await queryRunner.release();
    }
  }

  /**
   * Ejecuta múltiples operaciones de forma secuencial dentro de una transacción.
   *
   * Útil cuando tienes varias operaciones independientes que deben ser atómicas.
   *
   * @param operations - Array de funciones que retornan Promises
   * @returns Array con los resultados de cada operación
   *
   * @example
   * const [saleResult, inventoryResult] = await transactionService.executeSequentialTransaction([
   *   () => saleRepo.save(newSale),
   *   () => stockRepo.save(updatedStock),
   * ]);
   */
  async executeSequentialTransaction<T>(
    operations: Array<(queryRunner: QueryRunner) => Promise<T>>,
  ): Promise<T[]> {
    return this.executeInTransaction(async (queryRunner) => {
      const results: T[] = [];

      for (const operation of operations) {
        const result = await operation(queryRunner);
        results.push(result);
      }

      return results;
    });
  }
}
