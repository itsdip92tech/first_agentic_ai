import { Controller, Get, Query } from '@nestjs/common';
import { ToolCallingService } from './tool-calling.service';

@Controller('agentic')
export class ToolCallingController {
  constructor(private readonly toolCallingService: ToolCallingService) {}

  @Get('toolCalling')
  toolCalling(@Query('sign') sign: string): Promise<string> {
    return this.toolCallingService.toolCalling(sign);
  }
}
