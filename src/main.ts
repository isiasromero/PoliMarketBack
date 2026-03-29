import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MainMenu } from './cli/main.menu';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Asegura que el directorio data/ exista para el archivo de la base de datos SQLite.
 */
function ensureDataDirectory(): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Inicia la aplicación en modo API (servidor HTTP con Swagger).
 * Escucha en el puerto 3000 y sirve la interfaz de usuario de Swagger en /api/docs.
 */
async function startApiMode(): Promise<void> {
  ensureDataDirectory();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Habilita la tubería de validación global para la validación de DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // [OK] Habilitar CORS para permitir requests desde el frontend (localhost:4200)
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Configura la documentación de Swagger
  const config = new DocumentBuilder()
    .setTitle('PoliMarket API')
    .setDescription(
      'API REST para el Sistema de Gestión Comercial de PoliMarket. ' +
      'Gestiona autorizaciones de RRHH, ventas, inventario, proveedores, entregas y tareas.',
    )
    .setVersion('1.0')
    .addTag('Admin', 'Gestión de RRHH y autorizaciones (RF01)')
    .addTag('Sales', 'Gestión de ventas y clientes (RF02, RF03)')
    .addTag('Inventory', 'Gestión de bodega y stock (RF03, RF05)')
    .addTag('Suppliers', 'Gestión de órdenes de compra (RF04)')
    .addTag('Deliveries', 'Rastreo de entregas y despacho (RF05)')
    .addTag('Tasks', 'Gestión de tareas asignadas a vendedores')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`\n[API] PoliMarket API ejecutándose en http://localhost:${port}`);
  console.log(` Documentación Swagger en http://localhost:${port}/api/docs\n`);
}

/**
 * Inicia la aplicación en modo CLI (menús interactivos de consola).
 */
async function startCliMode(): Promise<void> {
  ensureDataDirectory();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const menu = app.get(MainMenu);
  await menu.run();

  await app.close();
  process.exit(0);
}

/**
 * Función de arranque para la aplicación PoliMarket.
 * Por defecto ejecuta AMBOS modos simultáneamente:
 * - Modo API: servidor HTTP con Swagger en puerto 3000
 * - Modo CLI: menús interactivos en la consola
 *
 * Parámetros opcionales:
 * - MODE=api: solo API (sin CLI)
 * - MODE=cli: solo CLI (sin API)
 * - npm run start: API + CLI (predeterminado)
 */
async function bootstrap(): Promise<void> {
  const mode = process.env['MODE'];

  ensureDataDirectory();

  // Crear una única instancia de la aplicación NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // [OK] Habilitar CORS para permitir requests desde el frontend (localhost:4200)
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Caso 1: Solo API
  if (mode === 'api') {
    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('PoliMarket API')
      .setDescription(
        'API REST para el Sistema de Gestión Comercial de PoliMarket. ' +
        'Gestiona autorizaciones de RRHH, ventas, inventario, proveedores, entregas y tareas.',
      )
      .setVersion('1.0')
      .addTag('Admin', 'Gestión de RRHH y autorizaciones (RF01)')
      .addTag('Sales', 'Gestión de ventas y clientes (RF02, RF03)')
      .addTag('Inventory', 'Gestión de bodega y stock (RF03, RF05)')
      .addTag('Suppliers', 'Gestión de órdenes de compra (RF04)')
      .addTag('Deliveries', 'Rastreo de entregas y despacho (RF05)')
      .addTag('Tasks', 'Gestión de tareas asignadas a vendedores')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env['PORT'] || 3000;
    await app.listen(port);
    console.log(`\n[API] PoliMarket API ejecutándose en http://localhost:${port}`);
    console.log(` Documentación Swagger en http://localhost:${port}/api/docs\n`);
    return;
  }

  // Caso 2: Solo CLI
  if (mode === 'cli') {
    const menu = app.get(MainMenu);
    await menu.run();
    await app.close();
    process.exit(0);
    return;
  }

  // Caso 3: API + CLI juntos (predeterminado)
  console.log('[INIT] Iniciando PoliMarket en modo HIBRIDO (API + CLI)...\n');

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('PoliMarket API')
    .setDescription(
      'API REST para el Sistema de Gestión Comercial de PoliMarket. ' +
      'Gestiona autorizaciones de RRHH, ventas, inventario, proveedores, entregas y tareas.',
    )
    .setVersion('1.0')
    .addTag('Admin', 'Gestión de RRHH y autorizaciones (RF01)')
    .addTag('Sales', 'Gestión de ventas y clientes (RF02, RF03)')
    .addTag('Inventory', 'Gestión de bodega y stock (RF03, RF05)')
    .addTag('Suppliers', 'Gestión de órdenes de compra (RF04)')
    .addTag('Deliveries', 'Rastreo de entregas y despacho (RF05)')
    .addTag('Tasks', 'Gestión de tareas asignadas a vendedores')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`[OK] API REST ejecutándose en http://localhost:${port}`);
  console.log(` Documentación en http://localhost:${port}/api/docs`);
  console.log(
    `\n[MENU] CLI esperando entrada. En otra terminal puedes hacer requests a la API.\n`,
  );

  // Iniciar CLI en paralelo
  const menu = app.get(MainMenu);
  await menu.run();

  // Cuando el usuario cierra el CLI, cerrar todo
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
