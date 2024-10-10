import { Body, Controller, Post } from '@nestjs/common';
import { JSONSchemaType } from 'ajv';
import { ValidationService } from './validation.service';

// Define a type for the expected request body
interface ValidateRequest {
  eventName: string;
  eventPayload: {
    name: string;
    age: number;
    lang_code: number;
  };
}

@Controller('validate')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post()
  validateSchema(@Body() body: ValidateRequest): {
    valid: boolean;
    errors?: any;
  } {
    const schema: JSONSchemaType<{
      name: string;
      age: number;
      lang_code: number;
    }> = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        lang_code: { type: 'number' },
      },
      required: ['name', 'age', 'lang_code'],
      additionalProperties: false,
    };

    const { valid, errors } = this.validationService.validate(
      schema,
      body.eventPayload,
    );

    return {
      valid,
      errors,
    };
  }
}
