import React, { useMemo, useState } from 'react';

const Checkbox = ({ checked, onChange, children, className, id, ...rest }) => {

	const _id = useMemo(() => {
		if (typeof id !== 'undefined') return id;
		return 'checkbox_' + Math.random().toString().split('.')[1];
	}, [id]);


	return (
		<label htmlFor={_id} className={"Checkbox" + (className ? ' ' + className : '')} {...rest}>
			<input id={_id} type="checkbox" checked={checked} onChange={({ target }) => onChange(target.checked)} />
			<span className="checkmark"></span>
			<span className="label">{children}</span>
		</label>
	);
}

export default Checkbox;