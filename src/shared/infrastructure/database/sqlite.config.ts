import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Configuración de la base de datos SQLite usando el controlador better-sqlite3.
 * El archivo de la base de datos se almacena en el directorio data/ en la raíz del proyecto.
 * Las migraciones se ejecutan automáticamente al iniciar la aplicación.
 */
export const sqliteConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env['DATABASE_PATH'] || './data/polimarket.db',
  entities: [__dirname + '/../../../**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: true,
  logging: process.env['NODE_ENV'] === 'development',
};
