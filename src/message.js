/*global chrome*/
import whevent from 'whevent';

export const sendMessage = (type, data) => new Promise(resolve => {
	if (typeof chrome !== 'undefined') {
		try {
			chrome.runtime.sendMessage({ type, data }, resolve);
		} catch(ex) {
			resolve();
		}
	} else {
		resolve();
	}
});

if (typeof chrome !== 'undefined' && chrome?.runtime?.onMessage?.addListener) {
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		whevent.emit(request.type, request.data);
	});
}