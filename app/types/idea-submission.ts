export interface TeammatePayload {
  name: string;
  gender?: string;
  email?: string;
  phone?: string;
  class?: string;
  branch?: string;
}

export type IdeaMember = TeammatePayload;

export interface SubmitIdeaRequest {
  name: string;
  gender: string;
  phone: string;
  email: string;
  class: string;
  branch?: string;
  idea: string;
  teamname?: string;
  team_name?: string;
  teammates?: TeammatePayload[];
}

export interface SubmittedTeammateData {
  name: string;
  gender?: string;
  email?: string;
  phone?: string;
  class?: string;
  branch?: string;
}

export interface SubmittedIdeaData {
  id: number;
  name: string;
  gender: string;
  phone: string;
  email: string;
  class: string;
  branch?: string;
  idea: string;
  team_name?: string;
  teamname?: string;
  teammates?: SubmittedTeammateData[];
  created_at: string;
}

export interface SubmitIdeaSuccessResponse {
  success: true;
  message: string;
  data: SubmittedIdeaData;
}

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface SubmitIdeaErrorResponse {
  success: false;
  error?: string;
  message: string;
  details?: ApiValidationErrorDetail[];
}

export type SubmitIdeaApiResponse =
  | SubmitIdeaSuccessResponse
  | SubmitIdeaErrorResponse;

export type SubmitIdeaResult =
  | {
      success: true;
      message: string;
      data: SubmittedIdeaData;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };
