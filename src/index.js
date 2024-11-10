import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

const darkTheme = createTheme({
  palette: {
   mode: 'dark',
  },
});

const container = document.getElementById('root');
const root = createRoot(container); // Create root instead of using ReactDOM.render
root.render(<ThemeProvider theme={darkTheme}><CssBaseline /><main><App /></main></ThemeProvider>);

