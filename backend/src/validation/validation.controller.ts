import { Body, Controller, Post } from '@nestjs/common';
import { JSONSchemaType } from 'ajv';
import { ValidationService } from './validation.service';

// Define a type for the expected request body
interface ValidateRequest {
  eventName: string;
  eventPayload: unknown;
}

const dummySchema: Record<string, JSONSchemaType<unknown>> = {
  //@ts-expect-error will figure out types
  entriapp_login_language_selected_clicked: {
    type: 'object',
    properties: {
      lang_code: { type: 'number' },
    },
    required: ['lang_code'],
    additionalProperties: false,
  },
  //@ts-expect-error will figure out types
  entriapp_sign_up_visibility_toggled: {
    type: 'object',
    properties: {
      value: { type: 'boolean' },
    },
    required: ['value'],
    additionalProperties: false,
  },
};

@Controller('validate')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post()
  validateSchema(@Body() body: ValidateRequest): {
    valid: boolean;
    errors?: any;
  } {
    const schema = dummySchema[body.eventName];

    // Handle case when schema does not exist for the eventName
    if (!schema) {
      return {
        valid: false,
        errors: `No schema found for event name: ${body.eventName}`,
      };
    }

    const { valid, errors } = this.validationService.validate(
      schema as JSONSchemaType<typeof body.eventPayload>, // Ensure correct type inference for the eventPayload
      body.eventPayload,
    );

    return {
      valid,
      errors,
    };
  }
}
