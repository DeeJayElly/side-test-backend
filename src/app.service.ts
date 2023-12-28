import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  apiStart(): string {
    return 'Side API Test started';
  }
}
