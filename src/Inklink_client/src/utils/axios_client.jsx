import axios from 'axios';

export const callApi = async (url, method, data, baseURL = 'http://localhost:8000') => {
  try {
    const response = await axios({
      method,
      url,
      data,
      baseURL, // 添加 baseURL 參數
    });
    return response;
  } catch (error) {
    if (error.response) {
      throw error.response.data; // 從後端回應中獲取錯誤信息
    } else {
      throw error.message; // 在其他情況下拋出錯誤信息
    }
  }
};
