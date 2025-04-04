/* eslint-disable */
import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
