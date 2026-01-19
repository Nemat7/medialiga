// import axios from 'axios';
//
// // Базовый URL API
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
//
// // Создаем экземпляр axios с настройками
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
//   timeout: 10000, // 10 секунд
// });
//
// // Интерцептор для добавления токена (если понадобится)
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// // Интерцептор для обработки ошибок
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Обработка истечения токена
//       localStorage.removeItem('access_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

import axios from 'axios';

// Базовый URL должен включать /api
const API_BASE_URL = 'http://localhost:8000';  // ← Важно: с /api!

export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // Теперь запросы будут: /api + endpoint
  headers: {
    'Content-Type': 'application/json',
  },
});

// Для отладки добавьте логирование
apiClient.interceptors.request.use(
  (config) => {
    console.log(`➡️ API Запрос: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`⬅️ API Ответ: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Ошибка:', {
      url: error.config?.url,
      fullUrl: error.config?.baseURL + error.config?.url,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);