import { Injectable } from '@nestjs/common';
import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';

@Injectable()
export class ValidationService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
    }); // Initialize AJV
  }

  // Validate data against a schema
  validate<T>(
    schema: JSONSchemaType<T>,
    data: T,
  ): {
    valid: boolean;
    errors:
      | ErrorObject<string, Record<string, any>, unknown>[]
      | null
      | undefined;
  } {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    return { valid, errors: validate.errors };
  }
}
