import { Body, Controller, Post } from '@nestjs/common';
import { JSONSchemaType } from 'ajv';
import { ValidationService } from './validation.service';

// Define a type for the expected request body
interface ValidateRequest {
  name: string;
  age: number;
}

@Controller('validate')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post()
  validateSchema(@Body() body: ValidateRequest): {
    valid: boolean;
    errors?: any;
  } {
    // Ensure strictNullChecks is enabled in tsconfig.json
    // Update the schema type to JSONSchemaType
    const schema: JSONSchemaType<{ name: string; age: number }> = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name', 'age'], // Ensure required fields are specified
      additionalProperties: false, // Set to false to disallow additional properties
    };

    const { valid, errors } = this.validationService.validate(schema, body);

    return {
      valid,
      errors,
    };
  }
}
