import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles.css';
import './public/public.css';
import './client/client.css';
import './admin/admin.css';

createRoot(document.getElementById('root')).render(<App />);
