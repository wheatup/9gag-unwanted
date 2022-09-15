import React, { useCallback, useEffect, useState } from 'react';

const TagsInput = ({ onChange, value, className, ...rest }) => {
	const [tags, setTags] = useState(value);
	const [text, setText] = useState('');

	useEffect(() => {
		if (value !== tags) {
			onChange(tags);
		}
	}, [tags, value]);

	const onEnter = useCallback(() => {
		if (text) {
			setTags([...new Set([...tags, text.trim()])]);
			setText('');
		}
	}, [text]);

	return (
		<div className={'TagsInput' + (className ? ' ' + className : '')}>{value.map((tag, i) => (
			<div className="tag" key={tag + '_' + i}>
				<span>{tag}</span>
				<i className="icon-cross" onClick={() => setTags(tags.filter(t => t !== tag))} />
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