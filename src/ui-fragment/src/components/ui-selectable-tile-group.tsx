import React from 'react';
import { CssClasses } from '../types';
import { renderComponents, setItemInState } from '../utils';

export interface SelectableTileGroupState {
	type: string;
	id: string | number;
	items?: any[];
	cssClasses?: CssClasses[];
	codeContext?: {
		name: string;
	};
}

export const UISelectableTileGroup = ({ state, setState, setGlobalState }: {
	state: SelectableTileGroupState;
	setState: (state: any) => void;
	setGlobalState: (state: any) => void;
}) => {
	if (state.type !== 'selectable-tile-group') {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <></>;
	}

	return <div
	role='group'
	aria-label='selectable tiles'
	className={state.cssClasses?.map((cc: any) => cc.id).join(' ')}>
		{
			state.items?.map((item: any) => {
				const setItem = (i: any) => setItemInState(i, state, setState);
				return renderComponents(item, setItem, setGlobalState);
			})
		}
	</div>;
};
