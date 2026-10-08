export interface RegisterRequest {
  name: string;
  gender: string;
  phone: string;
  email: string;
  branch?: string;
}

export interface RegisteredUserData {
  id: number;
  name: string;
  gender: string;
  phone: string;
  email: string;
  branch?: string;
  created_at: string;
}

export interface RegisterSuccessResponse {
  success: true;
  message: string;
  data: RegisteredUserData;
}

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface RegisterErrorResponse {
  success: false;
  error?: string;
  message: string;
  details?: ApiValidationErrorDetail[];
}

export type RegisterApiResponse =
  | RegisterSuccessResponse
  | RegisterErrorResponse;

export type RegistrationResult =
  | {
      success: true;
      message: string;
      data: RegisteredUserData;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };
