import './scss/style.scss';
import $ from 'whi18n';
import { useCallback, useEffect, useState } from 'react';
import TagsInput from './components/TagsInput';
import Checkbox from './components/Checkbox';
import { sendMessage } from './message';

function App({ settings }) {
	const [active, setActive] = useState(settings.active);
	const [tags, setTags] = useState(settings.tags);
	const [partialMatchTags, setPartialMatchTags] = useState(settings.partialMatchTags);
	const [ignoreCasesTags, setIgnoreCasesTags] = useState(settings.ignoreCasesTags);

	const [titles, setTitles] = useState(settings.titles);
	const [partialMatchTitles, setPartialMatchTitles] = useState(settings.partialMatchTitles);
	const [ignoreCasesTitles, setIgnoreCasesTitles] = useState(settings.ignoreCasesTitles);

	const [authors, setAuthors] = useState(settings.authors);

	const [hideCompletely, setHideCompletely] = useState(settings.hideCompletely);

	const [needUpdate, setNeedUpdate] = useState(false);

	useEffect(() => {
		if (needUpdate) {
			const data = {
				active,
				tags,
				partialMatchTags,
				ignoreCasesTags,
				titles,
				partialMatchTitles,
				ignoreCasesTitles,
				authors,
				hideCompletely,
			};
			sendMessage('UPDATE', data);
			setNeedUpdate(false);
		}
	}, [needUpdate, active, tags, partialMatchTags, ignoreCasesTags, titles, partialMatchTitles, ignoreCasesTitles, authors, hideCompletely]);

	const updateSetting = useCallback((event) => (...args) => {
		event(...args);
		setNeedUpdate(true);
	}, []);

	return (
		<div className="App">
			<h1>{$`title`}</h1>
			<div className={"form-area" + (active ? '' : ' inactive')}>

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`activity`}</label>
					</div>
					<div className="form-item-content">
						<div className="extra-settings">
							<Checkbox onChange={updateSetting(setActive)} checked={active}>{$`active`}</Checkbox>
						</div>
					</div>
				</div>

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`ignore-tags`}</label>
					</div>
					<div className="form-item-content">
						<div className="extra-settings">
							<Checkbox title={$`partial-match.tip`} onChange={updateSetting(setPartialMatchTags)} checked={partialMatchTags}>{$`partial-match`}</Checkbox>
							<Checkbox title={$`ignore-cases.tip`} onChange={updateSetting(setIgnoreCasesTags)} checked={ignoreCasesTags}>{$`ignore-cases`}</Checkbox>
						</div>
						<TagsInput id="ignore-tags" onChange={updateSetting(setTags)} value={tags} />
					</div>
				</div>

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`ignore-titles`}</label>
					</div>
					<div className="form-item-content">
						<div className="extra-settings">
							<Checkbox title={$`partial-match.tip`} onChange={updateSetting(setPartialMatchTitles)} checked={partialMatchTitles}>{$`partial-match`}</Checkbox>
							<Checkbox title={$`ignore-cases.tip`} onChange={updateSetting(setIgnoreCasesTitles)} checked={ignoreCasesTitles}>{$`ignore-cases`}</Checkbox>
						</div>
						<TagsInput id="ignore-title" onChange={updateSetting(setTitles)} value={titles} />
					</div>
				</div>

				{/* <div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`ignore-OPs`}</label>
					</div>
					<div className="form-item-content">
						<TagsInput
							id="ignore-ops"
							value={authors.map(author => ({
								...author, render: () => (
									<span key={author.name} className="author">
										{author.avatar ? <img src={author.avatar} alt={author.name} /> : <i className="icon-user"></i>}
										<span>{author.name}</span>
									</span>
								)
							}))}
							onAdd={name => ({ name })}
							onChange={updateSetting(setAuthors)} filter={(a, b) => {
								return a.name !== b.name;
							}}
						/>
					</div>
				</div> */}

				<div className="form-item">
					<div className="form-item-title">
						<label htmlFor="partial-match-ignore-tags">{$`misc`}</label>
					</div>
					<div className="form-item-content">
						<Checkbox title={$`hide-completely.tip`} onChange={updateSetting(setHideCompletely)} checked={hideCompletely}>{$`hide-completely`}</Checkbox>
					</div>
				</div>

			</div>
		</div>
	);
}

export default App;
