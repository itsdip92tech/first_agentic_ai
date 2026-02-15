import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { wrapOpenAI } from 'langsmith/wrappers';

@Module({
  providers: [
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) =>
        wrapOpenAI(
          new OpenAI({ apiKey: configService.getOrThrow('OPENAI_API_KEY') }),
        ),
      inject: [ConfigService],
    },
  ],
  exports: [OpenAI],
})
export class OpenAIModule {}
