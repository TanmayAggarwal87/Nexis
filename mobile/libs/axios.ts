import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://192.168.29.59:4000",
  withCredentials: true,

});