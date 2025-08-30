import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://192.168.x.x:4000",
  withCredentials: true,

});