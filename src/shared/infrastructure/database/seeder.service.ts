import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/producto.orm-entity';
import { WarehouseOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/bodega.orm-entity';
import { StockProductOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/stock-producto.orm-entity';
import { SellerOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/vendedor.orm-entity';
import { ClientOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/cliente.orm-entity';
import { HREmployeeOrmEntity } from '../../../modules/rrhh/infrastructure/persistence/entities/empleado-rrhh.orm-entity';
import { SupplierOrmEntity } from '../../../modules/proveedores/infrastructure/persistence/entities/proveedor.orm-entity';
import { TareaOrmEntity } from '../../../modules/tareas/infrastructure/persistence/entities/tarea.orm-entity';

/**
 * Servicio responsable de rellenar la base de datos con datos de demostración iniciales
 * al iniciar la aplicación. Implementa OnModuleInit para que se ejecute automáticamente
 * después de que el contenedor de inyección de dependencias de NestJS esté completamente inicializado.
 *
 * El seeder solo rellena datos cuando la tabla de productos está vacía,
 * lo que hace que sea seguro ejecutarse en cada inicio sin duplicar registros.
 */
@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,

    @InjectRepository(WarehouseOrmEntity)
    private readonly warehouseRepository: Repository<WarehouseOrmEntity>,

    @InjectRepository(StockProductOrmEntity)
    private readonly stockProductRepository: Repository<StockProductOrmEntity>,

    @InjectRepository(SellerOrmEntity)
    private readonly sellerRepository: Repository<SellerOrmEntity>,

    @InjectRepository(ClientOrmEntity)
    private readonly clientRepository: Repository<ClientOrmEntity>,

    @InjectRepository(HREmployeeOrmEntity)
    private readonly hrEmployeeRepository: Repository<HREmployeeOrmEntity>,

    @InjectRepository(SupplierOrmEntity)
    private readonly supplierRepository: Repository<SupplierOrmEntity>,

    @InjectRepository(TareaOrmEntity)
    private readonly tareaRepository: Repository<TareaOrmEntity>,
  ) {}

  /**
   * Hook del ciclo de vida ejecutado en la inicialización del módulo.
   * Comprueba si la base de datos está vacía y la rellena con datos de demostración si es necesario.
   */
  async onModuleInit(): Promise<void> {
    const productCount = await this.productRepository.count();

    if (productCount > 0) {
      this.logger.log('Database already contains data, skipping seed.');
      return;
    }

    this.logger.log('Seeding database with initial demo data...');

    await this.seedProducts();
    await this.seedSuppliers();
    await this.seedClients();
    await this.seedHREmployees();
    await this.seedSellers();
    await this.seedWarehouses();
    await this.seedStockProducts();
    await this.seedTasks();

    this.logger.log('Database seeding completed successfully.');
  }

  /**
   * Seeds three demo products: Laptop, Mouse, and Keyboard.
   * Each product is assigned to its primary supplier for auto-restocking:
   * - Laptop → TechSupply Corp (supplier ID 1)
   * - Mouse → GlobalParts Ltd (supplier ID 2)
   * - Keyboard → TechSupply Corp (supplier ID 1)
   * @private
   */
  private async seedProducts(): Promise<void> {
    const products: Partial<ProductOrmEntity>[] = [
      {
        name: 'Laptop',
        description: 'Laptop de alto rendimiento para trabajo y gaming',
        unitPrice: 1200000,
        category: 'Electronica',
        primarySupplierId: 1, // TechSupply Corp
      },
      {
        name: 'Mouse',
        description: 'Mouse ergonomico inalambrico',
        unitPrice: 50000,
        category: 'Perifericos',
        primarySupplierId: 2, // GlobalParts Ltd
      },
      {
        name: 'Keyboard',
        description: 'Teclado mecanico retroiluminado',
        unitPrice: 80000,
        category: 'Perifericos',
        primarySupplierId: 1, // TechSupply Corp
      },
    ];

    await this.productRepository.save(products);
    this.logger.log(`  -> ${products.length} products seeded.`);
  }

  /**
   * Seeds two demo suppliers: TechSupply Corp and GlobalParts Ltd.
   * @private
   */
  private async seedSuppliers(): Promise<void> {
    const suppliers: Partial<SupplierOrmEntity>[] = [
      {
        name: 'TechSupply Corp',
        contact: 'Juan Perez',
        phone: '+57 300 123 4567',
      },
      {
        name: 'GlobalParts Ltd',
        contact: 'Maria Lopez',
        phone: '+57 310 987 6543',
      },
    ];

    await this.supplierRepository.save(suppliers);
    this.logger.log(`  -> ${suppliers.length} suppliers seeded.`);
  }

  /**
   * Seeds three demo clients: Carlos Mendoza, Maria Rodriguez, Juan Garcia.
   * @private
   */
  private async seedClients(): Promise<void> {
    const clients: Partial<ClientOrmEntity>[] = [
      {
        name: 'Carlos Mendoza',
        address: 'Calle 45 #12-30, Bogota',
        phone: '+57 311 111 2222',
      },
      {
        name: 'Maria Rodriguez',
        address: 'Carrera 7 #80-15, Medellin',
        phone: '+57 312 333 4444',
      },
      {
        name: 'Juan Garcia',
        address: 'Avenida 6N #25-10, Cali',
        phone: '+57 313 555 6666',
      },
    ];

    await this.clientRepository.save(clients);
    this.logger.log(`  -> ${clients.length} clients seeded.`);
  }

  /**
   * Seeds one demo HR employee: Ana Torres (HR Manager).
   * @private
   */
  private async seedHREmployees(): Promise<void> {
    const employees: Partial<HREmployeeOrmEntity>[] = [
      {
        name: 'Ana Torres',
        position: 'HR Manager',
        email: 'ana.torres@polimarket.com',
      },
    ];

    await this.hrEmployeeRepository.save(employees);
    this.logger.log(`  -> ${employees.length} HR employees seeded.`);
  }

  /**
   * Seeds two demo sellers: Pedro Ramirez and Laura Gomez.
   * @private
   */
  private async seedSellers(): Promise<void> {
    const sellers: Partial<SellerOrmEntity>[] = [
      {
        name: 'Pedro Ramirez',
        identification: 'CC-1234567890',
        active: true,
      },
      {
        name: 'Laura Gomez',
        identification: 'CC-0987654321',
        active: true,
      },
    ];

    await this.sellerRepository.save(sellers);
    this.logger.log(`  -> ${sellers.length} sellers seeded.`);
  }

  /**
   * Seeds one demo warehouse: Main Warehouse at Central Location.
   * @private
   */
  private async seedWarehouses(): Promise<void> {
    const warehouses: Partial<WarehouseOrmEntity>[] = [
      {
        name: 'Main Warehouse',
        location: 'Central Location - Zona Industrial, Bogota',
      },
    ];

    await this.warehouseRepository.save(warehouses);
    this.logger.log(`  -> ${warehouses.length} warehouses seeded.`);
  }

  /**
   * Seeds three demo stock records linking products to the main warehouse
   * with initial available and minimum quantities.
   * - Laptop: 10 available, min 5
   * - Mouse: 50 available, min 20
   * - Keyboard: 30 available, min 15
   * @private
   */
  private async seedStockProducts(): Promise<void> {
    const stockProducts: Partial<StockProductOrmEntity>[] = [
      {
        productId: 1,
        warehouseId: 1,
        availableQuantity: 10,
        minimumQuantity: 5,
        shelfLocation: 'A-01',
      },
      {
        productId: 2,
        warehouseId: 1,
        availableQuantity: 50,
        minimumQuantity: 20,
        shelfLocation: 'B-03',
      },
      {
        productId: 3,
        warehouseId: 1,
        availableQuantity: 30,
        minimumQuantity: 15,
        shelfLocation: 'B-05',
      },
    ];

    await this.stockProductRepository.save(stockProducts);
    this.logger.log(`  -> ${stockProducts.length} stock records seeded.`);
  }

  /**
   * Seeds demo tasks for sellers.
   * Creates tasks with different statuses and types for demo purposes.
   * @private
   */
  private async seedTasks(): Promise<void> {
    const tasks: Partial<TareaOrmEntity>[] = [
      {
        sellerId: 1, // Pedro Ramirez
        title: 'Llamada a cliente Carlos Mendoza',
        description: 'Seguimiento de propuesta anterior para compra de laptops',
        type: 'LLAMADA',
        status: 'PENDIENTE',
        priority: 'ALTA',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
      },
      {
        sellerId: 1, // Pedro Ramirez
        title: 'Demo de Mouse inalambrico',
        description: 'Presentar características del mouse ergonomico a Maria Rodriguez',
        type: 'DEMO',
        status: 'PENDIENTE',
        priority: 'MEDIA',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      },
      {
        sellerId: 2, // Laura Gomez
        title: 'Seguimiento venta anterior',
        description: 'Verificar satisfacción del cliente Juan Garcia con compra de teclado',
        type: 'SEGUIMIENTO',
        status: 'EN_PROGRESO',
        priority: 'MEDIA',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
      },
      {
        sellerId: 2, // Laura Gomez
        title: 'Reunión presupuesto',
        description: 'Presentar propuesta de compra de 5 laptops a empresa cliente',
        type: 'REUNION',
        status: 'PENDIENTE',
        priority: 'ALTA',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      },
      {
        sellerId: 1, // Pedro Ramirez
        title: 'Entrega de mouse',
        description: 'Entregar 10 mouses a oficina de Carlos Mendoza',
        type: 'ENTREGA',
        status: 'COMPLETADA',
        priority: 'BAJA',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        completionDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      },
    ];

    await this.tareaRepository.save(tasks);
    this.logger.log(`  -> ${tasks.length} tasks seeded.`);
  }
}
