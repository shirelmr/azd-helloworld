import { ApplicationState } from './applicationState';
import { TodoActions, ActionTypes } from '../actions/common';

export function appReducer(state: ApplicationState, action: TodoActions): ApplicationState {
    switch (action.type) {
        case ActionTypes.LOAD_TODO_LISTS:
            return { ...state, lists: action.payload };
        case ActionTypes.LOAD_TODO_LIST:
        case ActionTypes.SELECT_TODO_LIST:
        case ActionTypes.SAVE_TODO_LIST:
            return { ...state, selectedList: action.payload };
        case ActionTypes.LOAD_TODO_ITEMS:
            // Attach items to selectedList and update lists array
            if (!state.selectedList) return state;
            const updatedSelectedList = {
                ...state.selectedList,
                items: action.payload
            };
            return {
                ...state,
                selectedList: updatedSelectedList,
                lists: state.lists?.map(list =>
                    list.id === updatedSelectedList.id ? updatedSelectedList : list
                )
            };        case ActionTypes.LOAD_TODO_ITEM:
        case ActionTypes.SELECT_TODO_ITEM:
            return { ...state, selectedItem: action.payload };
        case ActionTypes.SAVE_TODO_ITEM:
            // Update the selected item
            const updatedState = { ...state, selectedItem: action.payload };
            
            // Also update the item in the selectedList if it exists
            if (state.selectedList && state.selectedList.items) {
                const items = [...state.selectedList.items];
                const index = items.findIndex(item => item.id === action.payload.id);
                if (index > -1) {
                    // Update existing item
                    items[index] = action.payload;
                } else {
                    // Add new item
                    items.push(action.payload);
                }
                
                const updatedSelectedList = {
                    ...state.selectedList,
                    items: items
                };
                
                updatedState.selectedList = updatedSelectedList;
                
                // Also update the item in the lists array
                if (state.lists) {
                    updatedState.lists = state.lists.map(list => {
                        if (list.id === action.payload.listId) {
                            // Update the list that contains this item
                            const listItems = [...(list.items || [])];
                            const listIndex = listItems.findIndex(item => item.id === action.payload.id);
                            if (listIndex > -1) {
                                listItems[listIndex] = action.payload;
                            } else {
                                listItems.push(action.payload);
                            }
                            return { ...list, items: listItems };
                        } else if (list.id === state.selectedList?.id) {
                            // Update the selected list
                            return updatedSelectedList;
                        }
                        return list;
                    });
                }
            }
            
            return updatedState;
        case ActionTypes.DELETE_TODO_ITEM:
            if (!state.selectedList || !state.selectedList.items) return state;
            const filteredItems = state.selectedList.items.filter(i => i.id !== action.payload);
            const filteredList = { ...state.selectedList, items: filteredItems };
            return {
                ...state,
                selectedList: filteredList,
                lists: state.lists?.map(list =>
                    list.id === filteredList.id ? filteredList : list
                )
            };
        default:
            return state;
    }
}
