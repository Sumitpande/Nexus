import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";

export interface VerifyTokenResponse {
  valid: boolean;
  userId: string;
  email: string;
  name: string;
}

/**
 * HTTP client for communicating with auth-service
 */
export class AuthServiceClient {
  private client = axios.create({
    baseURL: AUTH_SERVICE_URL,
    timeout: 5000,
  });

  /**
   * Verify JWT token by calling auth-service
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await this.client.post<VerifyTokenResponse>(
        "/auth/verify",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Auth service unavailable");
    }
  }
}

export const authServiceClient = new AuthServiceClient();
