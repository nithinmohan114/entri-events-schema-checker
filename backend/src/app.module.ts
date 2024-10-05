import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationController } from './validation/validation.controller';
import { ValidationService } from './validation/validation.service';

@Module({
  imports: [],
  controllers: [AppController, ValidationController],
  providers: [AppService, ValidationService],
})
export class AppModule {}
