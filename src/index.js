/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import './scss/style.scss';
import App from './App';
import { init } from 'whi18n';
import i18n from './i18n/i18n';
import { sendMessage } from './message';
import whevent from 'whevent';

const DEFAULT_SETTINGS = {
	active: true,
	tags: [],
	partialMatchTags: false,
	ignoreCasesTags: true,

	titles: [],
	partialMatchTitles: true,
	ignoreCasesTitles: true,

	authors: [],

	hideCompletely: false
};

init('en-US', i18n);
if (window.location.href.includes('localhost')) {
	ReactDOM.render(
		<React.StrictMode>
			<App settings={DEFAULT_SETTINGS} />
		</React.StrictMode>,
		document.getElementById('root')
	);
} else {
	whevent.onOnce('INIT', settings => {
		ReactDOM.render(
			<React.StrictMode>
				<App settings={settings} />
			</React.StrictMode>,
			document.getElementById('root')
		);
	});

	sendMessage('INIT');
}
