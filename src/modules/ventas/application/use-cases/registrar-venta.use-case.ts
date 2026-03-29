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
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../../rrhh/domain/ports/outbound/autorizacion.repository.port';
import { VerifySufficientStockUseCase } from '../../../inventario/application/use-cases/verificar-stock-suficiente.use-case';

/** Detail line item within the sale registration input */
export interface RegisterSaleDetailInput {
  /** ID of the product being sold */
  productId: number;
  /** Number of units */
  quantity: number;
  /** Price per unit at the time of sale */
  unitPrice: number;
}

/** Input DTO for the register sale use case */
export interface RegisterSaleInput {
  /** ID of the seller making the sale */
  sellerId: number;
  /** ID of the client purchasing */
  clientId: number;
  /** Line items included in the sale */
  details: RegisterSaleDetailInput[];
}

/**
 * Use case responsible for registering a new sale in the system.
 * Validates that:
 * 1. The seller exists and is active
 * 2. The seller has ACTIVE authorization to access the sales system
 * 3. The client exists
 *
 * Then creates the sale with status CONFIRMED and all provided line-item details.
 *
 * BUSINESS RULE (RF01): No vendedor sin autorizaci\u00f3n previa puede registrar ventas.
 * Solo vendedores autorizados por HR pueden operar en el sistema.
 */
@Injectable()
export class RegisterSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY_TOKEN)
    private readonly saleRepository: ISaleRepository,
    @Inject(SELLER_REPOSITORY_TOKEN)
    private readonly sellerRepository: ISellerRepository,
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
    private readonly verifySufficientStockUseCase: VerifySufficientStockUseCase,
  ) {}

  /**
   * Executes the sale registration process.
   * @param input - The seller ID, client ID, and array of detail line items
   * @returns A Result containing the persisted Sale on success,
   *          or an error message if validation fails
   */
  async execute(input: RegisterSaleInput): Promise<Result<Sale>> {
    // VALIDACIÓN 1: Verificar que la venta tenga al menos un item
    if (!input.details || input.details.length === 0) {
      return err('A sale must have at least one detail line item');
    }

    // VALIDACIÓN 2: Verificar que el vendedor exista en la base de datos
    const seller = await this.sellerRepository.findById(input.sellerId);
    if (!seller) {
      return err(`Seller with ID ${input.sellerId} not found`);
    }

    // VALIDACIÓN 3: Verificar que el vendedor esté activo en el sistema
    if (!seller.active) {
      return err(`Seller with ID ${input.sellerId} is not active`);
    }

    // VALIDACIÓN 4 (CRÍTICA - RF01): Verificar que el vendedor está autorizado por HR
    // Esto implica que existe una autorización ACTIVA para acceder al sistema de ventas
    const authorization = await this.authorizationRepository.findActiveBySellerAndSystem(
      input.sellerId,
      'SALES',
    );

    if (!authorization) {
      return err(
        `Seller with ID ${input.sellerId} is not authorized to perform sales operations. ` +
        `Please contact HR to authorize this seller.`,
      );
    }

    // VALIDACIÓN 5: Verificar que el cliente existe en la base de datos
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      return err(`Client with ID ${input.clientId} not found`);
    }

    // VALIDACIÓN 6 (CRÍTICA - RF03): Verificar stock disponible para cada producto en la venta
    for (const detail of input.details) {
      const stockResult = await this.verifySufficientStockUseCase.execute(
        detail.productId,
        detail.quantity,
      );

      if (!stockResult.success) {
        return err(
          `Cannot register sale: ${stockResult.error} (Product ID: ${detail.productId})`,
        );
      }

      if (!stockResult.value) {
        return err(
          `Insufficient stock for product ID ${detail.productId}. ` +
          `Requested: ${detail.quantity} units.`,
        );
      }
    }

    // CREACIÓN DE VENTA: Una vez validadas todas las precondiciones, crear la venta
    const sale = new Sale({
      sellerId: input.sellerId,
      clientId: input.clientId,
      date: new Date(),
      status: 'CONFIRMED',
    });

    // Agregar cada detalle de línea a la venta
    for (const detail of input.details) {
      sale.addDetail(detail.productId, detail.quantity, detail.unitPrice);
    }

    // PERSISTENCIA: Guardar la venta en la base de datos
    const saved = await this.saleRepository.save(sale);
    return ok(saved);
  }
}
