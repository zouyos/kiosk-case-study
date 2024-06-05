import axios from "axios";

const BASE_URL: string = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }
});

export class IndicatorsAPI {
  static async fetchDimensions() {
    const response = await axiosInstance.get(`/dimensions`);
    return response.data.results;
  }

  static async fetchDimensionById(dimensionId: string) {
    const response = await axiosInstance.get(`/dimensions/${dimensionId}`);
    return response.data.results;
  }

  static async indicators(start: string, end: string, indicators: string[]) {
    const indicatorsQueryString = indicators.map(indicator => `indicators=${indicator}`).join('&');
    const response = await axios.get(`${BASE_URL}/indicators?start=${start}&end=${end}&${indicatorsQueryString}`);
    return response.data.results;
  }
}