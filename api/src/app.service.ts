import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'admin-platform API is running'
  }

  getHealth(): { status: string } {
    return { status: 'ok' }
  }
}
