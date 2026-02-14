import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ToolCallingModule } from './tool-calling/tool-calling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ToolCallingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
