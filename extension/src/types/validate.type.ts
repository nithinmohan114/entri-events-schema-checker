export namespace ValidateResponse {
  export interface Body {
    valid: boolean;
    errors?: Error[];
  }

  export interface Error {
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: Params;
    message: string;
  }

  export interface Params {
    type?: string;
    missingProperty?: string;
  }
}

export namespace ValidateRequest {
  export interface Payload {
    eventName: string;
    eventPayload?: EventPayload;
  }

  export interface EventPayload {
    [key: string]: string | number | boolean | unknown[];
  }
}

export interface EventForStorage {
  eventName: string;
  eventPayload: ValidateRequest.EventPayload;
  isValid: boolean;
  errors?: ValidateResponse.Error[];
  timestamp: string;
}
