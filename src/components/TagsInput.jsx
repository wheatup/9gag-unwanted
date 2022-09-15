import React, { useCallback, useEffect, useState } from 'react';

const TagsInput = ({ onChange, value, className, onAdd, filter, ...rest }) => {
	const [tags, setTags] = useState(value);
	const [text, setText] = useState('');

	useEffect(() => {
		if (JSON.stringify(value) !== JSON.stringify(tags)) {
			onChange(tags);
		}
	}, [tags, value]);

	const onEnter = useCallback(() => {
		if (text) {
			if (onAdd) {
				setTags([...tags, onAdd(text)]);
			} else {
				setTags([...new Set([...tags, text.trim()])]);
			}
			setText('');
		}
	}, [text, onAdd]);

	return (
		<div className={'TagsInput' + (className ? ' ' + className : '')}>{value.map((tag, i) => (
			<div className="tag" key={tag + '_' + i}>
				{typeof tag === 'object' ? tag.render() : <span>{tag}</span>}
				<i className="icon-cross" onClick={() => setTags(tags.filter(filter ? (t => filter(t, tag)) : (t => t !== tag)))} />
			</div>
		))}
			<input value={text} onChange={({ target }) => setText(target.value)} onKeyDown={({ key }) => {
				if (/\benter\b/i[Symbol.match](key)) {
					onEnter();
				}
			}} />
		</div>
	);
}

export default TagsInput;