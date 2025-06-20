import { CommandBar, DetailsList, DetailsListLayoutMode, IStackStyles, Selection, Label, Spinner, SpinnerSize, Stack, IIconProps, SearchBox, Text, IGroup, IColumn, MarqueeSelection, FontIcon, IObjectWithKey, CheckboxVisibility, IDetailsGroupRenderProps, getTheme, DatePicker, TimePicker, PrimaryButton, DefaultButton, Panel, PanelType, TextField } from '@fluentui/react';
import { ReactElement, useEffect, useState, FormEvent, FC, useRef } from 'react';
import { useNavigate } from 'react-router';
import { TodoItem, TodoItemState, TodoList } from '../models';
import { stackItemPadding } from '../ux/styles';

interface TodoItemListPaneProps {
    list?: TodoList
    items?: TodoItem[]
    selectedItem?: TodoItem;
    disabled: boolean
    onCreated: (item: TodoItem) => Promise<TodoItem> | void
    onDelete: (item: TodoItem) => void
    onComplete: (item: TodoItem) => void
    onSelect: (item?: TodoItem) => void
}

interface TodoDisplayItem extends IObjectWithKey {
    id?: string
    listId: string
    name: string
    state: TodoItemState
    description?: string
    dueDate: Date | string
    completedDate: Date | string
    data: TodoItem
    createdDate?: Date
    updatedDate?: Date
}

const addIconProps: IIconProps = {
    iconName: 'Add',
    styles: {
        root: {
        }
    }
};

const createListItems = (items: TodoItem[]): TodoDisplayItem[] => {
    return items.map(item => ({
        ...item,
        key: item.id,
        dueDate: item.dueDate ? new Date(item.dueDate).toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : 'None',
        completedDate: item.completedDate ? new Date(item.completedDate).toDateString() : 'N/A',
        data: item
    }));
};

const stackStyles: IStackStyles = {
    root: {
        alignItems: 'center'
    }
}

const TodoItemListPane: FC<TodoItemListPaneProps> = (props: TodoItemListPaneProps): ReactElement => {
    const theme = getTheme();
    const navigate = useNavigate();
    const [newItemName, setNewItemName] = useState('');
    const [items, setItems] = useState(createListItems(props.items || []));
    const [selectedItems, setSelectedItems] = useState<TodoItem[]>([]);
    const [isDoneCategoryCollapsed, setIsDoneCategoryCollapsed] = useState(true);
    const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // New item creation form state
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemDueDate, setNewItemDueDate] = useState<Date | undefined>(undefined);
    const [newItemDueTime, setNewItemDueTime] = useState<Date | undefined>(undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selection = new Selection({
        onSelectionChanged: () => {
            const selectedItems = selection.getSelection().map(item => (item as TodoDisplayItem).data);
            setSelectedItems(selectedItems);
        }
    });

    // Helper to format countdown with Seattle timezone
    const getCountdownString = (dueDate: Date) => {
        const now = new Date();
        
        // Use Intl.DateTimeFormat to get components in Seattle time
        const seattleFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Los_Angeles",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // Get current time components in Seattle timezone
        const nowParts = seattleFormatter.formatToParts(now);
        const nowSeattleStr = `${nowParts.find(p => p.type === 'year')?.value}-${nowParts.find(p => p.type === 'month')?.value}-${nowParts.find(p => p.type === 'day')?.value}T${nowParts.find(p => p.type === 'hour')?.value}:${nowParts.find(p => p.type === 'minute')?.value}:${nowParts.find(p => p.type === 'second')?.value}`;
        const nowSeattle = new Date(nowSeattleStr);
        
        // Get due date components in Seattle timezone
        const dueParts = seattleFormatter.formatToParts(dueDate);
        const dueSeattleStr = `${dueParts.find(p => p.type === 'year')?.value}-${dueParts.find(p => p.type === 'month')?.value}-${dueParts.find(p => p.type === 'day')?.value}T${dueParts.find(p => p.type === 'hour')?.value}:${dueParts.find(p => p.type === 'minute')?.value}:${dueParts.find(p => p.type === 'second')?.value}`;
        const dueSeattle = new Date(dueSeattleStr);
        
        // Calculate difference in milliseconds
        const diff = dueSeattle.getTime() - nowSeattle.getTime();
        
        // Debug logging
        console.log('Seattle Countdown calculation:', {
            nowUTC: now.toISOString(),
            nowSeattleStr,
            nowSeattle: nowSeattle.toISOString(),
            dueUTC: dueDate.toISOString(),
            dueSeattleStr,
            dueSeattle: dueSeattle.toISOString(),
            diffMs: diff,
            diffHours: diff / (1000 * 60 * 60)
        });
        
        if (diff <= 0) return 'Due!';
        
        // Convert to time units
        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        
        const days = totalDays;
        const hours = totalHours - (totalDays * 24);
        const minutes = totalMinutes - (totalHours * 60);
        const seconds = totalSeconds - (totalMinutes * 60);
        
        const result = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        console.log('Countdown result:', result);
        
        return result;
    };

    // Update countdowns every second, only if there are items with due dates
    useEffect(() => {
        const currentItems = props.items || [];
        if (currentItems.length === 0) {
            setCountdowns({});
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        
        const hasDueDates = currentItems.some(item => item.dueDate);
        if (!hasDueDates) {
            setCountdowns({});
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        
        // Clear existing interval
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Function to update countdowns
        const updateCountdowns = () => {
            const updated: { [key: string]: string } = {};
            currentItems.forEach(item => {
                if (item.dueDate && item.id) {
                    const due = new Date(item.dueDate);
                    updated[item.id] = getCountdownString(due);
                }
            });
            setCountdowns(updated);
        };
        
        // Initial update
        updateCountdowns();
        
        // Set up interval for continuous updates
        intervalRef.current = setInterval(updateCountdowns, 1000);
        
        return () => { 
            if (intervalRef.current) clearInterval(intervalRef.current); 
        };
    }, [props.items]); // Depend on props.items instead of local items state

    // Handle list changed
    useEffect(() => {
        setIsDoneCategoryCollapsed(true);
        setSelectedItems([]);
    }, [props.list]);

    // Handle items changed
    useEffect(() => {
        const sortedItems = (props.items || []).sort((a, b) => {
            if (a.state === b.state) {
                return a.name < b.name ? -1 : 1;
            }

            return a.state < b.state ? -1 : 1;
        })
        setItems(createListItems(sortedItems || []));
    }, [props.items]);

    // Handle selected item changed
    useEffect(() => {
        if (items.length > 0 && props.selectedItem?.id) {
            selection.setKeySelected(props.selectedItem.id, true, true);
        }

        const doneItems = selectedItems.filter(i => i.state === TodoItemState.Done);
        if (doneItems.length > 0) {
            setIsDoneCategoryCollapsed(false);
        }

    }, [items.length, props.selectedItem, selectedItems, selection])

    const groups: IGroup[] = [
        {
            key: TodoItemState.Todo,
            name: 'Todo',
            count: items.filter(i => i.state === TodoItemState.Todo).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.Todo),
        },
        {
            key: TodoItemState.InProgress,
            name: 'In Progress',
            count: items.filter(i => i.state === TodoItemState.InProgress).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.InProgress)
        },
        {
            key: TodoItemState.Done,
            name: 'Done',
            count: items.filter(i => i.state === TodoItemState.Done).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.Done),
            isCollapsed: isDoneCategoryCollapsed
        },
    ]

    const onFormSubmit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();

        if (newItemName && props.onCreated) {
            // Create a simple item when pressing Enter
            const item: TodoItem = {
                name: newItemName,
                listId: props.list?.id || '',
                state: TodoItemState.Todo,
            }
            
            const result = props.onCreated(item);
            if (result && typeof result.then === 'function') {
                result.then(() => setNewItemName(''));
            } else {
                setNewItemName('');
            }
        }
    }

    const onDetailedCreate = () => {
        // Open the create panel for detailed item creation with date/time
        if (newItemName) {
            setIsCreatePanelOpen(true);
        }
    }

    const onQuickCreate = () => {
        if (newItemName && props.onCreated) {
            const item: TodoItem = {
                name: newItemName,
                listId: props.list?.id || '',
                state: TodoItemState.Todo,
            }
            
            const result = props.onCreated(item);
            if (result && typeof result.then === 'function') {
                result.then(() => setNewItemName(''));
            } else {
                setNewItemName('');
            }
        }
    }

    const onDetailedCreateFromPanel = () => {
        if (newItemName && props.onCreated) {
            let dueDateTime: Date | undefined = undefined;
            
            if (newItemDueDate && newItemDueTime) {
                // Extract date components
                const year = newItemDueDate.getFullYear();
                const month = newItemDueDate.getMonth();
                const day = newItemDueDate.getDate();
                
                // Extract time components
                let hours = newItemDueTime.getHours();
                let minutes = newItemDueTime.getMinutes();
                
                // Validate time components
                if (isNaN(hours) || hours < 0 || hours > 23) {
                    console.warn('Invalid hours detected:', hours, 'Using 12 instead');
                    hours = 12;
                }
                if (isNaN(minutes) || minutes < 0 || minutes > 59) {
                    console.warn('Invalid minutes detected:', minutes, 'Using 0 instead');
                    minutes = 0;
                }
                
                // Create date/time string in ISO format for Seattle timezone
                const seattleTimeStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
                
                // Create date as if it's local time (which represents the Seattle time the user wants)
                dueDateTime = new Date(seattleTimeStr);
                
                console.log('Seattle timezone date creation:', {
                    userSelectedDate: newItemDueDate.toString(),
                    userSelectedTime: newItemDueTime.toString(),
                    seattleTimeStr,
                    finalDueDateTime: dueDateTime.toString(),
                    finalISO: dueDateTime.toISOString(),
                    verifySeattleTime: dueDateTime.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
                });
            } else if (newItemDueDate) {
                // Use date with default time (end of day)
                const year = newItemDueDate.getFullYear();
                const month = newItemDueDate.getMonth();
                const day = newItemDueDate.getDate();
                
                dueDateTime = new Date(year, month, day, 23, 59, 59, 999);
                
                console.log('Creating due date (date only):', {
                    selectedDate: newItemDueDate.toString(),
                    withEndOfDay: dueDateTime.toString(),
                    iso: dueDateTime.toISOString(),
                    seattleTime: dueDateTime.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
                });
            }

            const item: TodoItem = {
                name: newItemName,
                description: newItemDescription,
                listId: props.list?.id || '',
                state: TodoItemState.Todo,
                dueDate: dueDateTime
            }
            
            // Call onCreated and handle both Promise and void return types
            const result = props.onCreated(item);
            
            if (result && typeof result.then === 'function') {
                // It's a Promise
                result.then(() => {
                    // Reset form only after successful creation
                    setNewItemName('');
                    setNewItemDescription('');
                    setNewItemDueDate(undefined);
                    setNewItemDueTime(undefined);
                    setIsCreatePanelOpen(false);
                }).catch((error: any) => {
                    console.error('Error creating item:', error);
                    // Keep form open on error so user can retry
                });
            } else {
                // It's void, reset form immediately
                setNewItemName('');
                setNewItemDescription('');
                setNewItemDueDate(undefined);
                setNewItemDueTime(undefined);
                setIsCreatePanelOpen(false);
            }
        }
    }

    const onCancelCreate = () => {
        setIsCreatePanelOpen(false);
        // Don't reset the name since user might want to try again
    }

    const onNewItemChanged = (_evt?: FormEvent<HTMLInputElement>, value?: string) => {
        setNewItemName(value || '');
    }

    const selectItem = (item: TodoDisplayItem) => {
        navigate(`/lists/${item.data.listId}/items/${item.data.id}`);
    }

    const completeItems = () => {
        selectedItems.map(item => props.onComplete(item));
    }

    const deleteItems = () => {
        selectedItems.map(item => props.onDelete(item));
    }

    const columns: IColumn[] = [
        { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100 },
        { key: 'dueDate', name: 'Due', fieldName: 'dueDate', minWidth: 100 },
        { key: 'completedDate', name: 'Completed', fieldName: 'completedDate', minWidth: 100 },
    ];

    const groupRenderProps: IDetailsGroupRenderProps = {
        headerProps: {
            styles: {
                groupHeaderContainer: {
                    backgroundColor: theme.palette.neutralPrimary
                }
            }
        }
    }

    const renderItemColumn = (item: TodoDisplayItem, _index?: number, column?: IColumn) => {
        const fieldContent = item[column?.fieldName as keyof TodoDisplayItem] as string;

        switch (column?.key) {
            case "name":
                return (
                    <>
                        <Text variant="small" block>{item.name}</Text>
                        {item.description &&
                            <>
                                <FontIcon iconName="QuickNote" style={{ padding: "5px 5px 5px 0" }} />
                                <Text variant="smallPlus">{item.description}</Text>
                            </>
                        }
                    </>
                );
            case "dueDate":
                if (item.dueDate && item.dueDate !== 'None') {
                    return (
                        <>
                            <Text variant="small">{fieldContent}</Text>
                            <br />
                            <Text variant="small" style={{ color: '#d13438' }}>{countdowns[item.id ?? '']}</Text>
                        </>
                    );
                } else {
                    return (<Text variant="small">None</Text>);
                }
            default:
                return (<Text variant="small">{fieldContent}</Text>)
        }
    }

    // Only show spinner if props.items is undefined (not just empty array)
    const isLoading = typeof props.items === 'undefined';

    return (
        <Stack>
            <Stack.Item>
                <form onSubmit={onFormSubmit}>
                    <Stack horizontal styles={stackStyles}>
                        <Stack.Item grow={1}>
                            <SearchBox value={newItemName} placeholder="Add an item" iconProps={addIconProps} onChange={onNewItemChanged} disabled={props.disabled || isLoading} />
                        </Stack.Item>
                        <Stack.Item>
                            <PrimaryButton 
                                text="Quick Add" 
                                onClick={onQuickCreate} 
                                disabled={props.disabled || isLoading || !newItemName}
                                style={{ marginRight: 8 }}
                            />
                            <DefaultButton 
                                text="Add with Details" 
                                onClick={onDetailedCreate} 
                                disabled={props.disabled || isLoading || !newItemName}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <CommandBar
                                items={[
                                    {
                                        key: 'markComplete',
                                        text: 'Mark Complete',
                                        disabled: props.disabled || isLoading,
                                        iconProps: { iconName: 'Completed' },
                                        onClick: () => { completeItems() }
                                    },
                                    {
                                        key: 'delete',
                                        text: 'Delete',
                                        disabled: props.disabled || isLoading,
                                        iconProps: { iconName: 'Delete' },
                                        onClick: () => { deleteItems() }
                                    }
                                ]}
                                ariaLabel="Todo actions" />
                        </Stack.Item>
                    </Stack>
                </form>
            </Stack.Item>
            {(!isLoading && items.length > 0) &&
                <Stack.Item>
                    <MarqueeSelection selection={selection}>
                        <DetailsList
                            items={items}
                            groups={groups}
                            columns={columns}
                            groupProps={groupRenderProps}
                            setKey="id"
                            onRenderItemColumn={renderItemColumn}
                            selection={selection}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"
                            checkboxVisibility={CheckboxVisibility.always}
                            onActiveItemChanged={selectItem} />
                    </MarqueeSelection>
                </Stack.Item>
            }
            {isLoading &&
                <Stack.Item align="center" tokens={stackItemPadding}>
                    <Label>Loading List Items...</Label>
                    <Spinner size={SpinnerSize.large} labelPosition="top" /> 
                </Stack.Item>
            }
            {!isLoading && items.length === 0 &&
                <Stack.Item align="center" tokens={stackItemPadding}>
                    <Text>This list is empty.</Text>
                </Stack.Item>
            }
            
            <Panel
                headerText="Create New Item"
                isOpen={isCreatePanelOpen}
                onDismiss={onCancelCreate}
                type={PanelType.medium}
                closeButtonAriaLabel="Close"
            >
                <Stack tokens={{ childrenGap: 15 }}>
                    <Stack.Item>
                        <Text variant="medium">Item Name: {newItemName}</Text>
                    </Stack.Item>
                    <Stack.Item>
                        <TextField 
                            label="Description" 
                            placeholder="Add a description (optional)" 
                            value={newItemDescription} 
                            onChange={(_, value) => setNewItemDescription(value || '')} 
                            multiline
                            rows={3}
                        />
                    </Stack.Item>
                    <Stack.Item>
                        <DatePicker 
                            label="Due Date (optional)" 
                            placeholder="Select a due date"
                            value={newItemDueDate}
                            onSelectDate={(date) => setNewItemDueDate(date || undefined)}
                        />
                    </Stack.Item>
                    <Stack.Item>
                        <TimePicker 
                            label="Due Time (optional) - Seattle Time" 
                            placeholder="Select a due time"
                            value={newItemDueTime}
                            onChange={(_, time) => {
                                console.log('TimePicker onChange:', { 
                                    time: time?.toString(), 
                                    hours: time?.getHours(), 
                                    minutes: time?.getMinutes() 
                                });
                                setNewItemDueTime(time);
                            }}
                            useHour12={true}
                        />
                    </Stack.Item>
                    <Stack.Item>
                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            <PrimaryButton text="Create Item" onClick={onDetailedCreateFromPanel} />
                            <DefaultButton text="Cancel" onClick={onCancelCreate} />
                        </Stack>
                    </Stack.Item>
                </Stack>
            </Panel>
        </Stack>
    );
};

export default TodoItemListPane;