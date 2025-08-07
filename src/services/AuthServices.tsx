/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const BASE_URL = "http://localhost:2089"; // Replace with env variable if needed

class AuthService {
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async signup(userName: string, email: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, {
        userName,
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/getuserdetails?user_Id=${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async fetchUsers(params: {
  page: number;
  size: number;
  searchTerm?: string;
  userType?: string;
}): Promise<any> {
  try {
    const { page, size, searchTerm, userType } = params;
    const response = await axios.get(`${BASE_URL}/getallusers`, {
      params: {
        page,
        size,
        ...(searchTerm && { search: searchTerm }),
        ...(userType && { userType })
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
}

const authService = new AuthService();
export default authService;
