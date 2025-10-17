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

  async createUser(payload: any) {
  // const ff="1,4,5,54"
  const res = await axios.post(`${BASE_URL}/createuser`, payload);
  return res.data;
}

 async getUsernamesByIds(userIds: number[]) {
  // const ff="1,4,5,54"
  const res = await axios.post(`${BASE_URL}/getusername`, userIds);
  return res.data;
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

   async changeUserStatus(userId: number,actionstatus:number): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/changeuser_status?user_id=${userId}&actionstatus=${actionstatus}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

async fetchUsers(params: {
  page: number;
  size: number;
  userType?: string; // allow both string and number if needed
}): Promise<any> {
  try {
    const { page, size, userType } = params;

    const response = await axios.get(`${BASE_URL}/getallusers`, {
      params: {
        page,
        size,
        ...(userType !== undefined && userType !== null && { userType })
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
