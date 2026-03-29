import { Injectable } from '@nestjs/common';
import { Result } from '../shared/domain/result';
import { Sale } from '../modules/ventas/domain/entities/venta.entity';
import { Client } from '../modules/ventas/domain/entities/cliente.entity';
import { StockProduct } from '../modules/inventario/domain/entities/stock-producto.entity';
import {
  RegisterSaleUseCase,
  RegisterSaleInput,
} from '../modules/ventas/application/use-cases/registrar-venta.use-case';
import { GetClientsUseCase } from '../modules/ventas/application/use-cases/consultar-clientes.use-case';
import { GetSalesBySellerUseCase } from '../modules/ventas/application/use-cases/consultar-ventas-por-vendedor.use-case';
import { CreateClientUseCase } from '../modules/ventas/application/use-cases/crear-cliente.use-case';
import { UpdateClientUseCase } from '../modules/ventas/application/use-cases/actualizar-cliente.use-case';
import { DeleteClientUseCase } from '../modules/ventas/application/use-cases/eliminar-cliente.use-case';
import { GetClientUseCase } from '../modules/ventas/application/use-cases/obtener-cliente.use-case';
import { CheckAvailabilityUseCase } from '../modules/inventario/application/use-cases/consultar-disponibilidad.use-case';
import { VerifySufficientStockUseCase } from '../modules/inventario/application/use-cases/verificar-stock-suficiente.use-case';

/**
 * Facade that orchestrates Ventas (Sales) and Inventario (Inventory) use cases.
 * Provides a unified interface for sales registration, client queries,
 * and stock availability checks without containing any business logic itself.
 */
@Injectable()
export class VentasFacade {
  constructor(
    private readonly registerSaleUseCase: RegisterSaleUseCase,
    private readonly getClientsUseCase: GetClientsUseCase,
    private readonly getSalesBySellerUseCase: GetSalesBySellerUseCase,
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
    private readonly getClientUseCase: GetClientUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
    private readonly verifySufficientStockUseCase: VerifySufficientStockUseCase,
  ) {}

  /**
   * Registers a new sale in the system.
   * @param dto - Input containing sellerId, clientId, and detail line items
   * @returns A Result containing the persisted Sale on success,
   *          or an error message if validation fails
   */
  async registerSale(dto: RegisterSaleInput): Promise<Result<Sale>> {
    return this.registerSaleUseCase.execute(dto);
  }

  /**
   * Retrieves all clients registered in the system.
   * @returns A Result containing an array of all Client entities
   */
  async getClients(): Promise<Result<Client[]>> {
    return this.getClientsUseCase.execute();
  }

  /**
   * Retrieves all sales made by a specific seller.
   * @param sellerId - The ID of the seller whose sales to retrieve
   * @returns A Result containing an array of Sale entities for the seller,
   *          or an error message if the seller is not found
   */
  async getSalesBySeller(sellerId: number): Promise<Result<Sale[]>> {
    return this.getSalesBySellerUseCase.execute(sellerId);
  }

  /**
   * Checks the availability of a product across all warehouses.
   * @param productId - The ID of the product to check availability for
   * @returns A Result containing an array of StockProduct records on success,
   *          or an error message if no stock records are found
   */
  async checkAvailability(productId: number): Promise<Result<StockProduct[]>> {
    return this.checkAvailabilityUseCase.execute(productId);
  }

  /**
   * Verifies whether sufficient stock exists for a product.
   * @param productId - The ID of the product to verify stock for
   * @param quantity - The required quantity to check against
   * @returns A Result containing true if sufficient stock exists, false otherwise;
   *          or an error message if the product has no stock records
   */
  async verifySufficientStock(productId: number, quantity: number): Promise<Result<boolean>> {
    return this.verifySufficientStockUseCase.execute(productId, quantity);
  }

  /**
   * Creates a new client in the system.
   * @param name - Client's full name
   * @param phone - Client's phone number
   * @param address - Client's address
   * @param identification - Client's identification (cédula, NIT, etc.)
   * @returns A Result containing the created Client on success,
   *          or an error message if validation fails
   */
  async createClient(name: string, phone: string, address: string, identification: string): Promise<Result<Client>> {
    return this.createClientUseCase.execute(name, phone, address, identification);
  }

  /**
   * Updates an existing client's information.
   * @param id - The client ID to update
   * @param name - Updated client name (optional)
   * @param phone - Updated client phone (optional)
   * @param address - Updated client address (optional)
   * @param identification - Updated client identification (optional)
   * @returns A Result containing the updated Client on success,
   *          or an error message if validation fails
   */
  async updateClient(
    id: number,
    name?: string,
    phone?: string,
    address?: string,
    identification?: string,
  ): Promise<Result<Client>> {
    return this.updateClientUseCase.execute(id, name, phone, address, identification);
  }

  /**
   * Deletes a client from the system.
   * @param id - The client ID to delete
   * @returns A Result containing a success message on deletion,
   *          or an error message if the client is not found
   */
  async deleteClient(id: number): Promise<Result<string>> {
    return this.deleteClientUseCase.execute(id);
  }

  /**
   * Retrieves a specific client by ID.
   * @param id - The client ID to retrieve
   * @returns A Result containing the Client on success,
   *          or an error message if the client is not found
   */
  async getClient(id: number): Promise<Result<Client>> {
    return this.getClientUseCase.execute(id);
  }
}
