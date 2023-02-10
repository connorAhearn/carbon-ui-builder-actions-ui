/* eslint-disable react/react-in-jsx-scope */
// import React, { useEffect, useState } from 'react';
import {
	// Button,
	Dropdown
} from 'carbon-components-react';
import { css } from 'emotion';
import { useFragment } from '../../context';
// import { isPropertySignature } from 'typescript';
import { allComponents } from '../../fragment-components/index';
import { DraggableTileList } from '../../components';

// TODO: Come up with a new name for file & Component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ActionsPane = ({ addAction }: any) => {
	const [fragment, setFragment] = useFragment();

	//* ******************
	// Elements Dropdown
	//* ******************

	// Remove this helper array
	// Check for each action supported element type directly in recursive function
	const actionSupportedElementTypes: string[] =
        Object.values(allComponents)
            .filter(component => component.componentInfo.signals)
            .map(component => component.componentInfo.type);

	/**
     *
     * Recursive function that pulls all the elements in the fragment that are compatible with actions
     *
     * Depends on the 'actionSupportedElementTypes' array for selecting valid elements
     *
     * @param actionableElements Array of codeContext.name values for elements that can have actions
     * @param items Recursive data structure, each item may have an array of items depending on the fragment design
     * @returns final value of actionableElements, all the codeContext.name values for elements of our fragment that support actions
     */
	const searchForActionableElements = (actionableElements: string[], items: any): string[] => {
		for (let i = 0; i < items.length; i++) {
			if (actionSupportedElementTypes.includes(items[i].type)) {
				actionableElements.push(items[i].codeContext.name);
			}

			if (items[i].items) {
				searchForActionableElements(actionableElements, items[i].items);
			}
		}
		return actionableElements;
	};

	const actionableElements = searchForActionableElements([], fragment.data.items);
	const elementDropdownItems = actionableElements.map(element => ({ text: element }));

	//* ******************
	// Slots Dropdown
	//* ******************

	// TODO: Ideally should be implemented using AllComponents
	// Current feature set is just disabling buttons so this implementation fits
	// Future state this dropdown will need to be dynamic
	// Using AllComponents, check what slots are available for the selected element

	// const slotDropdownItems: string[] = [];
	const slotDropdownItems: { text: string }[] = [
		{ text: 'Toggle Disable' }
		// { text: 'Toggle Visibility' }
	];

	const handleActionUpdate = (action: any, item: any, updateType: String) => {
		// Current set of actions - but we remove the target action that we're changing
		const filteredActions = fragment.data.actions.map((val: any) => {
			if (updateType === 'actions') {
				val.destination = action.selectedItem.text;
			} else if (updateType === 'slots') {
				val.slot = action.selectedItem.text;
			}
			return val;
		});

		// TODO: Check other setFragments to format like below
		setFragment({
			...fragment,
			data: {
				...fragment.data,
				actions: filteredActions
			}
		});
	};

	const updateActionsList = (newList: any[]) => {
		setFragment({ ...fragment, data: {
			...fragment.data, actions: newList
		} });
	};

	const template = (item: any, _index: number) => {

		return (
			<>
            <h6 className={css`color: #323232; margin-bottom: 8px; font-weight: normal;`}>Signal Name</h6>
            <Dropdown
            id='elementDropdown'
            className={css`margin-bottom: 8px;`}
            size='sm'
            titleText='Element'
            label=''
            items={elementDropdownItems}
            itemToString={(item: any) => (item ? item.text : '')}
            onChange={(element: any) => handleActionUpdate(element, item, 'actions')}
            selectedItem={{ text: item.destination }}
            />
            <Dropdown
            id='slotDropdown'
            size='sm'
            titleText='Slot'
            label=''
            items={slotDropdownItems}
            itemToString={(item: any) => (item ? item.text : '')}
            onChange={(slot: any) => handleActionUpdate(slot, item, 'slots')}
            selectedItem={{ text: item.slot }}
            />

			</>
		);
	};

	return (
    <DraggableTileList
    dataList={fragment.data.actions}
    setDataList={updateActionsList}
    updateItem={handleActionUpdate}
    template={template}
    defaultObject={{
        signal: '',
        slot: ''
    }}
	/>
	);
};
