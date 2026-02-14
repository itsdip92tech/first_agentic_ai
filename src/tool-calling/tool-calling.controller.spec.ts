import { Test, TestingModule } from '@nestjs/testing';
import { ToolCallingController } from './tool-calling.controller';
import { ToolCallingService } from './tool-calling.service';

describe('ToolCallingController', () => {
  let controller: ToolCallingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolCallingController],
      providers: [ToolCallingService],
    }).compile();

    controller = module.get<ToolCallingController>(ToolCallingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
