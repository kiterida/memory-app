import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createRoot } from 'react-dom/client';
import App from './App';

import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

const darkTheme = createTheme({
  palette: {
   mode: 'dark',
  },
});

const container = document.getElementById('root');
const root = createRoot(container); // Create root instead of using ReactDOM.render
root.render(<ThemeProvider theme={darkTheme}><CssBaseline /><App /></ThemeProvider>);

