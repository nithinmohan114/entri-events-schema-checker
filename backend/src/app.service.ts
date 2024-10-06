import { Injectable } from '@nestjs/common';
import { Hello } from './app.interface';

@Injectable()
export class AppService {
  getHello(): Hello {
    return { test: 'Hello World!' };
  }
}
