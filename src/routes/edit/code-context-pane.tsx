import React from 'react';

import {
	AComponentCodeUI,
	allComponents
} from '../../fragment-components';

import { updatedState } from '../../components/fragment';
import { getSelectedComponent } from '../../sdk/src/tools';

const showComponentCodeOptions = (selectedComponent: any, setComponent: any, fragment: any) => {
	for (const component of Object.values(allComponents)) {
		// Find the UI for editing code props for our component
		if (selectedComponent.type === component.componentInfo.type && component.componentInfo.codeUI) {
			return <component.componentInfo.codeUI
				selectedComponent={selectedComponent}
				setComponent={setComponent} 
				/>;
		}
	}
	return <AComponentCodeUI selectedComponent={selectedComponent} setComponent={setComponent} />;
};

export const CodeContextPane = ({ fragment, setFragment }: any) => {
	const selectedComponent = getSelectedComponent(fragment);

	const setComponent = (component: any) => {
		setFragment({
			...fragment,
			data: updatedState(fragment.data, {
				type: 'update',
				component
			})
		});
	};

	return (
		<div className='context-pane-content'>
			{selectedComponent && showComponentCodeOptions(selectedComponent, setComponent, fragment)}
		</div>
	);
};
