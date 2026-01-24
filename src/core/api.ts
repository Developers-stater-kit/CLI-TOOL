import axios from "axios";
import { CliState } from "../types/constent";

const API_BASE_URL = "http://localhost:3000/api";

// this is example 
export async function resolveTemplates(state: CliState) {
  const response = await axios.post(
    `${API_BASE_URL}/resolve`,
    state
  );

  return response.data;
}
