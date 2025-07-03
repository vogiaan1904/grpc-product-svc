import { INestMicroservice, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { protobufPackage } from './protos/product.pb';
import { RpcInvalidArgumentException } from './common/exceptions/rpc.exception';
import { GlobalExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const PORT = process.env.PORT || 50053;

  try {
    const app: INestMicroservice = await NestFactory.createMicroservice(
      AppModule,
      {
        transport: Transport.GRPC,
        options: {
          url: `0.0.0.0:${PORT}`,
          package: protobufPackage,
          protoPath: join('node_modules/grpc-nest-proto/proto/product.proto'),
        },
      },
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => {
          console.log(errors);
          throw new RpcInvalidArgumentException('Validation failed');
        },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.enableShutdownHooks();

    await app.listen();
    logger.log('Product microservice is running');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
