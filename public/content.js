console.log('It\'s working');
let settings;

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

const sendMessage = (type, data) => new Promise(resolve => {
	chrome.runtime.sendMessage({ type, data }, resolve);
});

chrome.runtime.onMessage.addListener(({ type, data }) => {
	switch (type) {
		case 'SETTINGS_UPDATED':
			settings = data;
			init();
			break;
	}
});

const processPost = $post => {
	let { tags, partialMatchTags, ignoreCasesTags, titles, ignoreCasesTitles, partialMatchTitles, hideCompletely } = settings;
	$post.classList.remove('hidden');

	let _tags = [...$post.querySelectorAll('.post-tag a')].map($a => $a.innerText);
	let match = false;

	if (ignoreCasesTags) {
		_tags = _tags.map(tag => tag.toLowerCase());
		tags = tags.map(tag => tag.toLowerCase());
	}

	if (partialMatchTags) {
		match = _tags.some(tag => tags.some(_tag => tag.includes(_tag)));
	} else {
		match = _tags.some(tag => tags.includes(tag));
	}

	if (match) {
		$post.classList.add('hidden');
		const $hideTip = document.createElement('div');
		$hideTip.classList.add('hide-tip');
		const $button = document.createElement('button');
		$button.innerText = 'This post is hidden by 9GAG Unwanted, click to show';
		$button.addEventListener('click', () => {
			$post.classList.remove('hidden');
			$hideTip.remove();
		});
		$hideTip.appendChild($button);
		$post.insertAdjacentElement('beforebegin', $hideTip);
	}
}

const init = async () => {
	const $list = await waitUntil(() => document.querySelector('#container #page .main-wrap > section'));
	[...$list.querySelectorAll('.hide-tip')].forEach($tip => $tip.remove());
	[...$list.querySelectorAll('.list-stream > article[id]')].forEach($post => processPost($post));

	let { hideCompletely } = settings;
	if (hideCompletely) {
		document.body.classList.add('hide-completely');
	} else {
		document.body.classList.remove('hide-completely');
	}
}

(async () => {
	settings = await sendMessage('INIT');
	await init();

	const $list = await waitUntil(() => document.querySelector('#container #page .main-wrap > section'));
	new MutationObserver(mutationList => {
		const newPosts = [...mutationList].flatMap(({ addedNodes }) => [...addedNodes].flatMap(node => [...node.querySelectorAll('article[id]')]));
		newPosts.forEach($post => processPost($post));
	}).observe($list, { attributes: false, childList: true, subtree: false })
})();