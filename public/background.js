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

let settings, reset = false;

const waitUntil = condition => new Promise(resolve => {
	const interval = () => {
		const result = condition();
		if (typeof result !== 'undefined' && false !== result) {
			return resolve(result);
		}
		requestAnimationFrame(interval);
	};

	interval();
});

const updateSettings = (update, overwrite) => {
	settings = overwrite ? update : { ...settings, ...update };
	chrome.storage.sync.set({ _9gag_settings: settings });
	sendMessage('SETTINGS_UPDATED', settings);
};

chrome.storage.sync.get(['_9gag_settings'], ({ _9gag_settings }) => {
	if (!_9gag_settings || reset) {
		updateSettings(DEFAULT_SETTINGS, true);
	} else if (Object.entries(DEFAULT_SETTINGS).some(([key, value]) => typeof _9gag_settings[key] !== typeof value)) {
		const updateKeys = Object.keys(DEFAULT_SETTINGS).filter(key => typeof _9gag_settings[key] !== typeof DEFAULT_SETTINGS[key]);
		const updateObject = Object.fromEntries(updateKeys.map(key => [key, DEFAULT_SETTINGS[key]]));
		updateSettings({ ..._9gag_settings, ...updateObject });
	} else {
		settings = _9gag_settings;
	}
});

chrome.runtime.onInstalled.addListener(() => {
	if (typeof chrome.declarativeContent !== "undefined") {
		// Supports chrome.declarativeContent
		chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
			chrome.declarativeContent.onPageChanged.addRules([
				{
					conditions: [
						new chrome.declarativeContent.PageStateMatcher({
							pageUrl: {
								hostContains: "9gag",
							},
						}),
					],
					actions: [new chrome.declarativeContent.ShowPageAction()],
				},
			]);
		});
	}

	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (changeInfo.status === 'complete') {
			sendMessage('TAB_UPDATED', null, tabId);
		}
	})
});

const sendMessage = (type, data, tabId) => {
	chrome.runtime.sendMessage({ type, data });
	if (tabId) {
		chrome.tabs.sendMessage(tabId, { type, data });
	} else {
		chrome.tabs.query({
			active: true
		}, tabs => {
			tabs.forEach(tab => {
				chrome.tabs.sendMessage(tab.id, { type, data });
			});
		});
	}
}


chrome.runtime.onMessage.addListener(async ({ type, data }, sender, sendResponse) => {
	switch (type) {
		case 'INIT':
			await waitUntil(() => settings);
			sendMessage('INIT', settings);
			break;
		case 'UPDATE':
			updateSettings(data);
			break;
		case 'ADD_TAG':
			updateSettings({ tags: [...new Set([...settings.tags, data])] });
			break;
	}
});


