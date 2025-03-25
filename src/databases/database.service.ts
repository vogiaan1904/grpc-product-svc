import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(private readonly configService: ConfigService) {
    super();
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database successfully');
    } catch (error) {
      this.logger.error('Failed to initialzie the database: ', error);
      throw new InternalServerErrorException(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
