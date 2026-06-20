import axios from "axios";

const API = axios.create({
  baseURL: "https://connect-backend-1z2r.onrender.com/api",
});

export default API;