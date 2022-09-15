/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import './scss/style.scss';
import App from './App';
import { init } from 'whi18n';
import i18n from './i18n/i18n';
import { sendMessage } from './message';

const DEFAULT_SETTINGS = {
	tags: [],
	partialMatchTags: false,
	ignoreCasesTags: true,

	titles: [],
	partialMatchTitles: true,
	ignoreCasesTitles: true,

	hideCompletely: false
};

init('en-US', i18n);

if (typeof chrome !== 'undefined') {
	sendMessage('INIT').then(settings => {
		settings = settings || DEFAULT_SETTINGS;
		ReactDOM.render(
			<React.StrictMode>
				<App settings={settings} />
			</React.StrictMode>,
			document.getElementById('root')
		);
	})
} else {
	ReactDOM.render(
		<React.StrictMode>
			<App settings={DEFAULT_SETTINGS} />
		</React.StrictMode>,
		document.getElementById('root')
	);
}