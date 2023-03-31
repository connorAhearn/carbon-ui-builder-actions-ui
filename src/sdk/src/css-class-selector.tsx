import React, { useEffect, useState } from 'react';
import {
	FormLabel,
	Tag,
	Tooltip
} from 'carbon-components-react';
import { ColorPalette16 } from '@carbon/icons-react';
import { css } from 'emotion';

const compareClasses = (sc1: any, sc2: any) => sc1.name < sc2.name ? -1 : 1;

export const CssClassSelector = ({ selectedClasses, setSelectedClasses, styleClasses }: any) => {
	const getAvailableClasses = () => {
		// available is anything in styleClasses, not yet in selecteClasses, sorted
		return styleClasses
			?.filter((sc: any) => !selectedClasses?.find((ssc: any) => ssc.id === sc.id))
			.map((sc: any) => ({ id: sc.id, name: sc.name })) // content is fetched from global as needed and we don't want stale content here
			.sort(compareClasses) || [];
	};

	const [availableClasses, setAvailableClasses] = useState(getAvailableClasses());

	useEffect(() => {
		if (!selectedClasses) {
			setSelectedClasses([]);
		}
	}, [selectedClasses, setSelectedClasses]);

	useEffect(() => {
		// update available classes based on styleClasses and selectedClasses
		setAvailableClasses(getAvailableClasses());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [styleClasses, selectedClasses]);

	const selectStyleClass = (styleClass: any) => {
		setSelectedClasses([...selectedClasses, styleClass]);
		setAvailableClasses(availableClasses.filter((c: any) => c.id !== styleClass.id));
	};

	const deselectStyleClass = (styleClass: any) => {
		setSelectedClasses(selectedClasses.filter((c: any) => c.id !== styleClass.id));
		setAvailableClasses([...availableClasses, styleClass].sort(compareClasses));
	};

	return (
		<div>
			<FormLabel>Selected classes</FormLabel>
			<br />
			{
				selectedClasses?.map((styleClass: any) => (
					<Tag
					key={styleClass.name}
					filter
					onClose={() => deselectStyleClass(styleClass)}>
						{styleClass.name}
					</Tag>
				))
			}
			<br />
			<FormLabel>
				Available classes
				<div className={css`display: inline; position: relative; top: 3px;`}>
					<Tooltip className={css`z-index: 9999;`}>
						Add or modify classes in the <ColorPalette16 /> Style menu on the left of the editor
					</Tooltip>
				</div>
			</FormLabel>
			<br />
			{
				availableClasses.map((styleClass: any) => (
					<Tag
					key={styleClass.name}
					onClick={() => selectStyleClass(styleClass)}>
						{styleClass.name}
					</Tag>
				))
			}
		</div>
	);
};

export const ComponentCssClassSelector = ({ componentObj, setComponent, styleClasses }: any) => {
	const setSelectedClasses = (cssClasses: any[], updateActionHistory = true) => {
		setComponent(
			{
				...componentObj,
				cssClasses
			},
			updateActionHistory
		);
	};

	return (
		<CssClassSelector
			selectedClasses={componentObj.cssClasses}
			setSelectedClasses={setSelectedClasses}
			styleClasses={styleClasses} />
	);
};
