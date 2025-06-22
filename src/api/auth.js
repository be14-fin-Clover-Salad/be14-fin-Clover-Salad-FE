import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://api.saladerp.com";

// 일반 요청용 인스턴스
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인터셉터 미적용된 리프레시 토큰 재발급용 (리프레시 토큰 재발급 요청 무한 루프 방지)
const rawApi = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인 페이지에서는 토큰 재발급 로직 제외
    const isLoginPage = window.location.pathname === "/login";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginPage
    ) {
      originalRequest._retry = true;

      const auth = useAuthStore();
      try {
        const refreshRes = await rawApi.post("/auth/refresh-token");
        const newAccessToken =
          refreshRes.headers["authorization"]?.split(" ")[1];

        if (newAccessToken) {
          auth.setAccessToken(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        auth.clearToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
