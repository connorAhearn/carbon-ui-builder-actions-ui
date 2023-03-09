import { useEffect, useState } from 'react';

import { DraggableTileList } from '../../components';
/* eslint-disable react/react-in-jsx-scope */
// import React, { useEffect, useState } from 'react';
import {
	Dropdown
} from 'carbon-components-react';
// import { isPropertySignature } from 'typescript';
import { allComponents } from '../../fragment-components/index';
import { css } from 'emotion';
import { useFragment } from '../../context';
import _ from 'lodash';

interface ActionProps {
	text: String;
	source: String;
	signal: String;
	destination: String;
	slot: String;
	slot_param: String;
	id: Number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ActionsPane = ({ addAction, sourceComponent }: any) => {
	const [fragment, setFragment] = useFragment();

	// Collect the actions stored in the fragment that are relevant to the currently selected component
	const relatedActions = (fragment.data.actions) ? fragment.data.actions.filter((action: any) => action.source === sourceComponent.id) : [];

	// Create actionState, default value is the collection of related actions from the fragment
	const [actionState, setActionState] = useState<ActionProps[]>(relatedActions);

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
     * @param idNameMap Object with keys that are code context names of the actionable items and value containing the corresponding IDs
     * @param nameIdMap Object with keys that are IDs of the actionable items and value containing the corresponding code context names
     * @returns final value of actionableElements, all the codeContext.name values for elements of our fraxrgment that support actions
     */
	const searchForActionableElements =
	(actionableElements: string[], items: any, idNameMap: any, nameIdMap: any): {actionableElements: string[]; idNameMap: any; nameIdMap: any} => {
		items.forEach((item: any) => {
			if (actionSupportedElementTypes.includes(item.type)) {
				actionableElements = [
					...actionableElements,
					item.codeContext.name
				];
				nameIdMap = {
					...nameIdMap,
					[item.codeContext.name]: item.id
				};
				idNameMap = {
					...idNameMap,
					[item.id]: item.codeContext.name
				};
			}

			if (item.items) {
				const searchResult = searchForActionableElements(actionableElements, item.items, idNameMap, nameIdMap);
				idNameMap = searchResult.idNameMap;
				actionableElements = searchResult.actionableElements;
				nameIdMap = searchResult.nameIdMap;
			}

		});
		return { actionableElements: actionableElements, idNameMap: idNameMap, nameIdMap: nameIdMap };
	};

	const actionableElementsSearchResult = searchForActionableElements([], fragment.data.items, {}, {});
	const actionableElements = actionableElementsSearchResult.actionableElements;
	const idNameMap = actionableElementsSearchResult.idNameMap;
	const nameIdMap = actionableElementsSearchResult.nameIdMap;
	console.log('actionableElements', actionableElements);
	const elementDropdownItems = actionableElements.map(element => ({ text: element }));

	// TODO: Ideally should be implemented using AllComponents
	// Current feature set is just disabling buttons so this implementation fits
	// const slotDropdownItems: { text: string }[] = [
	// 	{ text: 'Toggle Disable' }
	// 	// { text: 'Toggle Visibility' }
	// ];
	
	// Object.values(availableSlots).map(slot => ({ text: slot })) in line 177 is exactly same as slotDropdownItems
	// This object acts as a map that maps the slot field in JSON to the UI slot dropdown selected item
	const availableSlots: any = {
		'isDisabled': 'Toggle Disable'
	};

	const handleActionUpdate = (action: any, item: any, updateType: String) => {
		const filteredActions = actionState.map(currentAction => {
			if (currentAction.id === item.id) {
				if (updateType === 'actions') {
					currentAction.destination = nameIdMap[action.selectedItem.text];
				} else if (updateType === 'slots') {
					// hardcode the slot field in JSON export
					switch (action.selectedItem.text) {
						case 'Toggle Disable':
							currentAction.slot = 'isDisabled';
							break;
						default:
							currentAction.slot = action.selectedItem.text;
					}
				} else if (updateType === 'slotParam') {
					// hardcode the slot_param field in JSON export
					switch (action.selectedItem.text) {
						case 'True':
							currentAction.slot_param = 'true';
							break;
						case 'False':
							currentAction.slot_param = 'false';
							break;
						default:
							currentAction.slot_param = action.selectedItem.text;
					}
				}
			}
			return currentAction;
		});
		setActionState(filteredActions);
	};

	useEffect(() => {
		const completedActions = actionState.filter(currentAction => currentAction.destination !== '' && currentAction.slot !== '');
		const unrelatedActions = (fragment.data.actions) ? fragment.data.actions.filter((action: any) => action.source !== sourceComponent.id) : [];
		setFragment({
			...fragment,
			data: {
				...fragment.data,
				actions: [...unrelatedActions, ...completedActions]
			}
		});
	}, [actionState]);

	useEffect(() => {
		setActionState(relatedActions);
	}, [sourceComponent]);

	const updateActionsList = (newList: any[]) => {
		setActionState(newList);
	};

	const template = (item: any, _index: number) => {
		console.log(item)
		return (
			<>
            <h6 className={css`color: #323232; margin-bottom: 8px; font-weight: normal;`}>{item.text || 'New Action'}</h6>
            <Dropdown
            id='elementDropdown'
            className={css`margin-bottom: 1rem; background-color: #fff`}
            size='sm'
            titleText='Element'
            label=''
            items={elementDropdownItems}
            itemToString={(item: any) => (item ? item.text : '')}
            onChange={(element: any) => handleActionUpdate(element, item, 'actions')}
            selectedItem={{ text: idNameMap[item.destination] }}
            />
            <Dropdown
            id='slotDropdown'
            size='sm'
            titleText='Slot'
            label=''
            items={Object.values(availableSlots).map(slot => ({ text: slot }))}
            itemToString={(item: any) => (item ? item.text : '')}
            onChange={(slot: any) => handleActionUpdate(slot, item, 'slots')}
            selectedItem={{ text: availableSlots[item.slot] }}
            className={css`background-color: #fff`}
            />
			<Dropdown
			id='slotParam'
			size='sm'
			titleText='Slot Parameter'
			label=''
			items={[{ text: 'True' }, { text: 'False' }]}
			itemToString={(item: any) => (item ? item.text : '')}
			onChange={(slot: any) => handleActionUpdate(slot, item, 'slotParam')}
			selectedItem={{ text: _.capitalize(item.slot_param) }}		// hardcode true/false into True/False to be shown in the dropdown
			className={css`background-color: #fff`}
            />
			</>
		);
	};

	return (
    <DraggableTileList
    dataList={actionState}
    setDataList={updateActionsList}
    updateItem={handleActionUpdate}
    template={template}
    defaultObject={{
			text: 'On click',
			source: sourceComponent.id,
			signal: 'onclick',
			destination: '',
			slot: '',
			slot_param: '',
			id: actionState.length
		}}
	/>
	);
};
