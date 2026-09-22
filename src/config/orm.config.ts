import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigEnum } from '../enum/config.enum'
import { getEnv } from '../utils/common'

// 通过dotENV来解析不同的配置
export function buildConnectionOptions() {
  const defaultConfig = getEnv('.env')
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`)
  // configService
  const config = { ...defaultConfig, ...envConfig }

  const logFlag = config['LOG_ON'] === 'true'

  console.log(process.env.NODE_ENV)
  // 以本文件编译后的位置为基准：nest 跑 dist 时匹配 .js，ts-node 跑 src 时匹配 .ts
  const entitiesDir = [`${__dirname}/../**/entities/*.entity{.js,.ts}`]

  return {
    type: config[ConfigEnum.DB_TYPE],
    host: config[ConfigEnum.DB_HOST],
    port: config[ConfigEnum.DB_PORT],
    username: config[ConfigEnum.DB_USERNAME],
    password: config[ConfigEnum.DB_PASSWORD],
    database: config[ConfigEnum.DB_DATABASE],
    entities: entitiesDir,
    logging: logFlag && process.env.NODE_ENV === 'development',
    // logging: false,
  } as TypeOrmModuleOptions
}

export const connectionParams = buildConnectionOptions()
