import { AxiosResponse } from "axios";
import { httpService } from "../lib/httpService";
import { ValidateRequest, ValidateResponse } from "../types/validate.type";

export const validateEvent = (
  event: ValidateRequest.Payload
): Promise<AxiosResponse<ValidateResponse.Body>> => {
  return httpService.post("/validate", event);
};
