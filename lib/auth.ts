import axios from 'axios';

let cachedToken: string | null = null;

export async function getToken() {
  if (cachedToken) return cachedToken;

  try {
    const response = await axios.post(`${process.env.OPENMETADATA_BASE_URL}/users/login`, {
      email: "admin@open-metadata.org",
      password: Buffer.from("Admin@1234!").toString('base64')
    });

    cachedToken = response.data.accessToken;
    return cachedToken;
  } catch (error) {
    console.error('Failed to get OpenMetadata token:', error);
    throw error;
  }
}

// Interceptor to handle 401 and refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      cachedToken = null; // Clear cache
      const token = await getToken();
      error.config.headers['Authorization'] = `Bearer ${token}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
