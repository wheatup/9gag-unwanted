import React from 'react';
import ReactDOM from 'react-dom';
import './scss/style.scss';
import App from './App';
import { init } from 'whi18n';
import i18n from './i18n/i18n';

init('en-US', i18n);

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
