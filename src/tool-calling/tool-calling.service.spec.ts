import { Test, TestingModule } from '@nestjs/testing';
import { ToolCallingService } from './tool-calling.service';

describe('ToolCallingService', () => {
  let service: ToolCallingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolCallingService],
    }).compile();

    service = module.get<ToolCallingService>(ToolCallingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
