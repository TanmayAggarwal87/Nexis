import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://nexis-production.up.railway.app",
  withCredentials: true,

});