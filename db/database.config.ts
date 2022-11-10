import { DataSourceOptions, DataSource } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'

config()
const configService = new ConfigService()

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: configService.get('DB_URL'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: false,
}

const dataSource = new DataSource(dataSourceOptions)

export default dataSource
