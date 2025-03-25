import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './categories/categories.module';
import { DatabaseModule } from './databases/database.module';
import { ProductModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision', 'staging')
          .default('development'),
        DATABASE_HOST: Joi.string(),
        DATABASE_NAME: Joi.string(),
        DATABASE_USERNAME: Joi.string(),
        DATABASE_PASSWORD: Joi.string(),
        DATABASE_PORT: Joi.number(),
        DATABASE_URI: Joi.string(),
        //...
      }),
      validationOptions: {
        abortEarly: false,
      },
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env' : '.env.prod',
      // load: [databaseConfig],
      cache: true,
      expandVariables: true,
    }),
    ProductModule,
    DatabaseModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
