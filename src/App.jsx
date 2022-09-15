import './scss/style.scss';
import $ from 'whi18n';
import { useCallback, useEffect, useState } from 'react';
import TagsInput from './components/TagsInput';
import Checkbox from './components/Checkbox';
import { sendMessage } from './message';

function App({ settings }) {
	console.log(settings);

	const [tags, setTags] = useState(settings.tags);
	const [partialMatchTags, setPartialMatchTags] = useState(settings.partialMatchTags);
	const [ignoreCasesTags, setIgnoreCasesTags] = useState(settings.ignoreCasesTags);

	const [titles, setTitles] = useState(settings.titles);
	const [partialMatchTitles, setPartialMatchTitles] = useState(settings.partialMatchTitles);
	const [ignoreCasesTitles, setIgnoreCasesTitles] = useState(settings.ignoreCasesTitles);

	const [hideCompletely, setHideCompletely] = useState(settings.hideCompletely);

	const [needUpdate, setNeedUpdate] = useState(false);

	useEffect(() => {
		if (needUpdate) {
			const data = {
				tags,
				partialMatchTags,
				ignoreCasesTags,
				titles,
				partialMatchTitles,
				ignoreCasesTitles,
				hideCompletely
			};
			sendMessage('UPDATE', data);
			setNeedUpdate(false);
		}
	}, [needUpdate, tags, partialMatchTags, ignoreCasesTags, titles, partialMatchTitles, ignoreCasesTitles, hideCompletely]);

	const updateSetting = useCallback((event) => (...args) => {
		console.log(...args);
		event(...args);
		setNeedUpdate(true);
	}, []);

	return (
		<div className="App">
			<h1>{$`title`}</h1>
			<div className="form-area">

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`ignore-tags`}</label>
					</div>
					<div className="form-item-content">
						<div class="extra-settings">
							<Checkbox onChange={updateSetting(setPartialMatchTags)} checked={partialMatchTags}>{$`partial-match`}</Checkbox>
							<Checkbox onChange={updateSetting(setIgnoreCasesTags)} checked={ignoreCasesTags}>{$`ignore-cases`}</Checkbox>
						</div>
						<TagsInput id="ignore-tags" onChange={updateSetting(setTags)} value={tags} />
					</div>
				</div>

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`ignore-title`}</label>
					</div>
					<div className="form-item-content">
						<div class="extra-settings">
							<Checkbox onChange={updateSetting(setPartialMatchTitles)} checked={partialMatchTitles}>{$`partial-match`}</Checkbox>
							<Checkbox onChange={updateSetting(setIgnoreCasesTitles)} checked={ignoreCasesTitles}>{$`ignore-cases`}</Checkbox>
						</div>
						<TagsInput id="ignore-title" onChange={updateSetting(setTitles)} value={titles} />
					</div>
				</div>

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`misc`}</label>
					</div>
					<div className="form-item-content">
						<Checkbox onChange={updateSetting(setHideCompletely)} checked={hideCompletely}>{$`hide-completely`}</Checkbox>
					</div>
				</div>

			</div>
		</div>
	);
}

export default App;
