let settings, inited;
let $iframe, $container, sideOpened = false;

const waitUntil = condition => new Promise(resolve => {
  const interval = () => {
    const result = condition();
    if (![undefined, null, false].includes(result)) {
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
    case 'INIT':
      if (inited) return;
      if (data) {
        settings = data;
      }
      inited = true;
      init();
      break;
    case 'SETTINGS_UPDATED':
      // if (JSON.stringify(data) === JSON.stringify(settings)) return;
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
  if ($post.getAttribute('data-unwanted-checked')) return;
  $post.setAttribute('data-unwanted-checked', true);

  let { tags, active, partialMatchTags, ignoreCasesTags, titles, ignoreCasesTitles, partialMatchTitles, authors, hideCompletely, sideComments } = settings;
  $post.classList.remove('hidden');

  $post.style.setProperty('--height', ($post.scrollHeight || 1200) + 'px');

  if (!$post.getAttribute('data-processed')) {
    let hasChildren = !!$post.children.length;
    $post.setAttribute('data-processed', true);
    new MutationObserver(mutationList => {
      if (!hasChildren && $post.children.length) {
        if ($post.previousSibling && $post.previousSibling.classList && $post.previousSibling.classList.contains('hide-tip')) {
          $post.previousSibling.remove();
        }
        processPost($post);
      }
      hasChildren = !!$post.children.length;
    }).observe($post, { attributes: false, childList: true, subtree: false })
  }

  if (!active) return;

  const $tags = [...$post.querySelectorAll('.post-tags a')];

  $tags.forEach(processTag);

  const $comment = $post.querySelector('a.comment');
  if ($comment && !$comment.getAttribute('data-processed')) {
    $comment.setAttribute('data-processed', true);
    $comment.addEventListener('click', e => {
      if (settings.sideComments) {
        e.preventDefault();
        e.stopPropagation();
        openSideMenu(e.currentTarget.href);
      }
    }, true);
  }

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
  (await waitUntil(() => {
    const $tags = [...document.querySelectorAll('#container :is(.main-wrap, #main) > .post-list-tag a')];
    return ($tags.length > 0) && $tags;
  })).forEach(processTag);
}

const createCommentContainer = () => {
  if (document.querySelector('._9gag_unwanted_container') && $container) return;
  $container = document.createElement('div');
  $container.classList.add('_9gag_unwanted_container');
  $container.style.display = 'none';

  const $backdrop = document.createElement('div');
  $backdrop.classList.add('_9gag_unwanted_backdrop');
  $backdrop.addEventListener('click', () => {
    $container.addEventListener('transitionend', () => {
      $iframe.src = 'about:blank';
      $container.style.display = 'none';
    }, { once: true });
    $container.classList.remove('open');
    document.body.classList.remove('side-comment-open');
    sideOpened = false;
  });
  $container.appendChild($backdrop);

  const $iframeContainer = document.createElement('div');
  $iframeContainer.classList.add('iframe-container');

  $iframe = document.createElement('iframe');
  $iframeContainer.appendChild($iframe)

  $container.appendChild($iframeContainer);

  document.body.appendChild($container);
}

const openSideMenu = url => {
  if (!url) return;
  sideOpened = true;
  document.body.classList.add('side-comment-open');
  $container.removeAttribute('style');
  $iframe && ($iframe.src = url);
  $iframe.addEventListener("load", ev => {
    ev.target.contentDocument.body.classList.add('_9gag_unwanted_comment-side')
    ev.target.contentDocument.body.style.overflowX = 'hidden';
  });
  requestAnimationFrame(() => {
    document.querySelector('._9gag_unwanted_container')?.classList.add('open');
  });
}

const update = async () => {
  [...document.querySelectorAll('[data-unwanted-checked]')].forEach($tag => $tag.removeAttribute('data-unwanted-checked'));

  let { hideCompletely } = settings;
  if (hideCompletely) {
    document.body.classList.add('hide-completely');
  } else {
    document.body.classList.remove('hide-completely');
  }

  const $list = await waitUntil(() => document.querySelector('#container #page :is(.main-wrap, #main) > section'));
  [...$list.querySelectorAll('.hide-tip')].forEach($tip => $tip.remove());
  [...$list.querySelectorAll('.list-stream > article[id]')].forEach($post => processPost($post));
}

const init = async () => {
  await update();
  createCommentContainer();
  processHeaderTags();

  const check = () => {
    [...document.querySelectorAll('article[id]:not([data-unwanted-checked="true"])')].forEach(processPost);
    requestAnimationFrame(check);
  }
  check();
};

sendMessage('INIT');

setInterval(() => {
  const tags = [...document.querySelectorAll('.post-tag a')];
  tags.filter(tag => !tag.querySelector('.close')).forEach(processTag);
}, 1000)