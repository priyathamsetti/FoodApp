import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://10.30.28.124:3500', // Set your base URL here
});

export default instance;
