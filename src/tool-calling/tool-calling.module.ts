import { Module } from '@nestjs/common';
import { ToolCallingService } from './tool-calling.service';
import { ToolCallingController } from './tool-calling.controller';
import { OpenAIModule } from '../openAi/openai.module';

@Module({
  imports: [OpenAIModule],
  controllers: [ToolCallingController],
  providers: [ToolCallingService],
})
export class ToolCallingModule {}
