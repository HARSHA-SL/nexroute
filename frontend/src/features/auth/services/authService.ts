import axios from "@/services/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(
  payload: LoginRequest
): Promise<LoginResponse> {
  const { data } = await axios.post(
    "/auth/login",
    payload
  );

  return data;
}