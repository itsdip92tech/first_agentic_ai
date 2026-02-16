import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  constructor(private readonly openai: OpenAI) {}

  async chatComplemetion(
    parameters: Record<any, any>,
  ): Promise<OpenAI.Responses.Response> {
    console.log('Input');
    console.log(JSON.stringify(parameters));
    const chat = await this.openai.responses.create({ ...parameters });
    console.log('Output');
    console.log(JSON.stringify(chat.output));
    return chat;
  }
}
