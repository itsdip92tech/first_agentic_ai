import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAIService } from 'src/llm/openai.service';
@Injectable()
export class ToolCallingService {
  constructor(
    private readonly openai: OpenAI,
    private readonly openAIService: OpenAIService,
  ) {}

  async toolCalling(param: string): Promise<string> {
    // 1. Define a list of callable tools for the model
    const tools: OpenAI.Responses.Tool[] = [
      {
        type: 'function',
        name: 'get_horoscope',
        description: "Get today's horoscope for an astrological sign.",
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            sign: {
              type: 'string',
              description: 'An astrological sign like Taurus or Aquarius',
            },
          },
          required: ['sign'],
          additionalProperties: false,
        },
      },
      {
        type: 'function',
        name: 'validate_parentheses',
        description:
          'Check if the parentheses provided are in order such that for every open parentheses there must be closing parentheses in order.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            parantheses: {
              type: 'string',
              description: 'A set of parentheses in an unspecified order',
            },
          },
          required: ['parantheses'],
          additionalProperties: false,
        },
      },
    ];

    // Function that is provided access to the model as a tool
    async function checkParentheses(parentheses: string): Promise<boolean> {
      const url = `http://localhost:3000/hash-map/validParentheses?str=${parentheses}`;
      const result = await fetch(url, { method: 'GET' });
      const data = (await result.json()) as Promise<boolean>;
      console.log(data);
      return data;
    }

    // Function that is provided access to the model as a tool
    function getHoroscope(sign: string) {
      return `Your astrological sign is ${sign}`;
    }

    // Create a running input list we will add to over time
    const input: OpenAI.Responses.ResponseInputItem[] = [
      {
        role: 'system',
        content: `
        You are a help-desk agent tasked with guiding user queries. You must identify the type of query and select the relevant tool.
        The queries may contain either astrological sign, set of parentheses, both or none. 
        - If only set of parentheses are present you must call the validate_parentheses tool.
        - If only astrological sign is present you must call the get_horoscope tool.
        - If both are present you need to chose the first pattern from the input either the validate_parentheses or the get_horoscope tool.
        - If neither of astrological sign or parentheses are present, you need to prompt the user to enter a valid input.`,
      },
      {
        role: 'user',
        content: `The user has entered the following data ${param}.`,
      },
      {
        role: 'assistant',
        content: `The user has entered - cancer, The response should be from the get_horoscope tool call output.
          The user has entered - {{}, The response should be from the validate_parentheses tool call output.
          The user has entered parentheses first and astrological sign after - [cancer, The response should be from the validate_parentheses tool call output.
          The user has entered astrological sign first and parentheses after- cancer)), The response should be from the get_horoscope tool call output.
          The user has entered neither astrological sign nor parentheses Example - Wine, The response should be -  Please enter a astrological sign or a set of parentheses.`,
      },
    ];

    // 2. Prompt the model with tools defined
    let response = await this.openAIService.chatComplemetion({
      model: 'gpt-4o',
      tools,
      input,
    });

    // Add the model's output (including function_call items) to the input history
    input.push(...response.output);

    // Build tool call
    const toolResults = response.output.map(async (item) => {
      if (item.type === 'function_call') {
        if (item.name === 'get_horoscope') {
          // 3. Execute the function logic for get_horoscope
          const args = JSON.parse(item.arguments) as { sign: string };
          const result = getHoroscope(args.sign);
          return { type: 'horsocope', call_id: item.call_id, result: result };
        }
        if (item.name === 'validate_parentheses') {
          // 3. Execute the function logic for validate_parentheses
          const args = JSON.parse(item.arguments) as { parantheses: string };
          const result = await checkParentheses(args.parantheses);
          return { type: 'parentheses', call_id: item.call_id, result: result };
        }
      }
    });

    // 4. Execute tool call
    const results = await Promise.all(toolResults);

    // Build the input for the next call with the function call output
    if (results[0]?.type == 'horsocope') {
      input.push({
        type: 'function_call_output',
        call_id: results[0].call_id,
        output: JSON.stringify(results[0].result),
      });
    } else if (results[0]?.type == 'parentheses') {
      input.push({
        type: 'function_call_output',
        call_id: results[0].call_id,
        output: JSON.stringify(results[0].result),
      });
    }

    response = await this.openAIService.chatComplemetion({
      model: 'gpt-4o',
      instructions:
        'You must return the exact tool call output that you receive in the string format without any additional characters.',
      tools,
      input,
    });

    // 5. The model should be able to give a response!
    return JSON.stringify(response.output, null, 2);
  }
}
