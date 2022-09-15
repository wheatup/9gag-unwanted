let settings, inited;

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
	console.log({ type, data });
	switch (type) {
		case 'INIT':
			if (inited) return;
			if (data) {
				settings = data;
			}
			inited = true;
			init();
			break;
		case 'SETTINGS_UPDATED':
			if (JSON.stringify(data) === JSON.stringify(settings)) return;
			if (data) {
				settings = data;
			}
			update();
			break;
		case 'TAB_UPDATED':
			if (data) {
				settings = data;
			}
			processHeaderTags();
			update();
			break;
	}
});

const processTag = $tag => {
	const $close = document.createElement('span');
	$close.classList.add('close');
	$close.setAttribute('title', 'Block this tag');
	$close.addEventListener('click', e => {
		e.preventDefault();
		e.stopPropagation();
		sendMessage('ADD_TAG', $tag.innerText);
	});
	$tag.appendChild($close);
}

const processPost = $post => {
	let { tags, active, partialMatchTags, ignoreCasesTags, titles, ignoreCasesTitles, partialMatchTitles, authors, hideCompletely } = settings;
	$post.classList.remove('hidden');

	if (!active) return;

	const $tags = [...$post.querySelectorAll('.post-tag a')];

	$tags.forEach(processTag);

	let _tags = $tags.map($a => $a.innerText);
	let match = false;

	if (tags.length) {
		if (ignoreCasesTags) {
			_tags = _tags.map(tag => tag.toLowerCase());
			tags = tags.map(tag => tag.toLowerCase());
		}

		if (partialMatchTags) {
			match = _tags.some(tag => tags.some(_tag => tag.includes(_tag)));
		} else {
			match = _tags.some(tag => tags.includes(tag));
		}
	}

	if (!match && titles.length) {
		const $title = $post.querySelector('header h1');
		if ($title) {
			let _title = $title.innerText
			if (ignoreCasesTitles) {
				_title = _title.toLowerCase();
				titles = titles.map(title => title.toLowerCase());
			}

			if (partialMatchTitles) {
				match = titles.some(title => _title.includes(title));
			} else {
				match = titles.includes(_title);
			}
		}
	}

	// if (!match && authors.length) {
	// 	let _author = $post.querySelector('.post-header.ui-post-creator__author').innerText;
	// 	match = authors.some(author => author.name === _author);
	// }

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

const processHeaderTags = async () => {
	(await waitUntil(() =>{
		const $tags = [...document.querySelectorAll('#container .main-wrap > .post-tag a')];
		console.log($tags);

		return ($tags.length > 0) && $tags;
	})).forEach(processTag);
}

const update = async () => {
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


const init = async () => {
	await update();
	processHeaderTags();

	const $list = await waitUntil(() => document.querySelector('#container #page .main-wrap > section'));
	new MutationObserver(mutationList => {
		const newPosts = [...mutationList].flatMap(({ addedNodes }) => [...addedNodes].flatMap(node => [...node.querySelectorAll('article[id]')]));
		newPosts.forEach($post => processPost($post));
	}).observe($list, { attributes: false, childList: true, subtree: false })
};

sendMessage('INIT');