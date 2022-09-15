import './scss/style.scss';
import $ from 'whi18n';
import { useState } from 'react';
import TagsInput from './components/TagsInput';
import Checkbox from './components/Checkbox';

function App() {

	const [tags, setTags] = useState(['AAA', 'BBB']);
	const [fullMatchTags, setFullMatchTags] = useState(false);

	return (
		<div className="App">
			<h1>{$`title`}</h1>
			<div className="form-area">
				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="full-match-ignore-tags">{$`ignore-tags`}</label>
						<Checkbox onChange={setFullMatchTags} checked={fullMatchTags}>{$`full-match`}</Checkbox>
					</div>
					<div className="form-item-content">
						<TagsInput id="ignore-tags" onChange={setTags} value={tags} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
