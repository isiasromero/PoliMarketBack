import { DataSource } from 'typeorm';

/**
 * Configuración del DataSource de TypeORM utilizado por la CLI para generar/ejecutar migraciones.
 * Este archivo es referenciado por los comandos CLI de typeorm en los scripts de package.json.
 */
export default new DataSource({
  type: 'better-sqlite3',
  database: process.env['DATABASE_PATH'] || './data/polimarket.db',
  entities: [__dirname + '/../../../**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
