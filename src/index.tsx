import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Chart, registerables } from 'chart.js';
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@mui/styles';
import App from './App';

Chart.register(...registerables);

// Configure JSS
const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
});

ReactDOM.render(
  <React.StrictMode>
    <StylesProvider jss={jss}>
      <App />
    </StylesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);