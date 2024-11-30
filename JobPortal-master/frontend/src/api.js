import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000/api',
});

const setAuthToken = token => {
  console.log("AuthenticationToken",token);
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { api, setAuthToken };
