import { DataSource } from 'typeorm';
import { ConfigService } from './config.service';

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.getValue('POSTGRES_HOST'),
  port: parseInt(configService.getValue('POSTGRES_PORT')),
  username: configService.getValue('POSTGRES_USER'),

  password: configService.getValue('POSTGRES_PASSWORD'),
  database: configService.getValue('POSTGRES_DATABASE'),
  synchronize: false,
  entities: [__dirname + '/../shared/entities/*.entity{.ts,.js}'],
  migrationsTableName: 'migration',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  ssl: configService.isProduction() ? { rejectUnauthorized: false } : false,
});
