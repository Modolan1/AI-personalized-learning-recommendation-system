import API from './api';
export const authService = {
  login: async (payload) => (await API.post('/auth/login', payload)).data,
  register: async (payload) => (await API.post('/auth/register', payload)).data,
};
