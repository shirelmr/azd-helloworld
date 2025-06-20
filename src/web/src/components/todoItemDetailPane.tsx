import { Text, DatePicker, Stack, TextField, PrimaryButton, DefaultButton, Dropdown, IDropdownOption, FontIcon, TimePicker } from '@fluentui/react';
import { useEffect, useState, FC, ReactElement, MouseEvent, FormEvent } from 'react';
import { TodoItem, TodoItemState } from '../models';
import { stackGaps, stackItemMargin, stackItemPadding, titleStackStyles } from '../ux/styles';

interface TodoItemDetailPaneProps {
    item?: TodoItem;
    onEdit: (item: TodoItem) => void
    onCancel: () => void
}

export const TodoItemDetailPane: FC<TodoItemDetailPaneProps> = (props: TodoItemDetailPaneProps): ReactElement => {
    const [name, setName] = useState(props.item?.name || '');
    const [description, setDescription] = useState(props.item?.description);
    const [dueDate, setDueDate] = useState(props.item?.dueDate);
    const [dueTime, setDueTime] = useState<Date | undefined>(props.item?.dueDate ? new Date(props.item?.dueDate) : undefined);
    const [state, setState] = useState(props.item?.state || TodoItemState.Todo);

    useEffect(() => {
        setName(props.item?.name || '');
        setDescription(props.item?.description);
        const itemDueDate = props.item?.dueDate ? new Date(props.item?.dueDate) : undefined;
        setDueDate(itemDueDate);
        setDueTime(itemDueDate);
        setState(props.item?.state || TodoItemState.Todo);
    }, [props.item]);

    const saveTodoItem = (evt: MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();

        if (!props.item?.id) {
            return;
        }

        let finalDueDate: Date | undefined = undefined;
        
        if (dueDate && dueTime) {
            // Create a date object representing the Seattle time the user selected
            const year = dueDate.getFullYear();
            const month = dueDate.getMonth();
            const day = dueDate.getDate();
            const hours = dueTime.getHours();
            const minutes = dueTime.getMinutes();
            
            // Create date in local time, representing what the user intended
            finalDueDate = new Date(year, month, day, hours, minutes, 0, 0);
            
            console.log('Updated due date:', {
                selectedDate: dueDate.toString(),
                selectedTime: dueTime.toString(),
                combined: finalDueDate.toString(),
                iso: finalDueDate.toISOString(),
                seattleTime: finalDueDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
            });
        } else if (dueDate) {
            // Use date with default time (end of day)
            const year = dueDate.getFullYear();
            const month = dueDate.getMonth();
            const day = dueDate.getDate();
            
            finalDueDate = new Date(year, month, day, 23, 59, 59, 999);
            
            console.log('Updated due date (date only):', {
                selectedDate: dueDate.toString(),
                withEndOfDay: finalDueDate.toString(),
                iso: finalDueDate.toISOString(),
                seattleTime: finalDueDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
            });
        }

        const todoItem: TodoItem = {
            id: props.item.id,
            listId: props.item.listId,
            name: name,
            description: description,
            dueDate: finalDueDate,
            state: state,
        };

        props.onEdit(todoItem);
    };

    const cancelEdit = () => {
        props.onCancel();
    }

    const onStateChange = (_evt: FormEvent<HTMLDivElement>, value?: IDropdownOption) => {
        if (value) {
            setState(value.key as TodoItemState);
        }
    }

    const onDueDateChange = (date: Date | null | undefined) => {
        setDueDate(date || undefined);
    }

    const onDueTimeChange = (_: any, time: Date) => {
        setDueTime(time);
    }

    const todoStateOptions: IDropdownOption[] = [
        { key: TodoItemState.Todo, text: 'To Do' },
        { key: TodoItemState.InProgress, text: 'In Progress' },
        { key: TodoItemState.Done, text: 'Done' },
    ];

    return (
        <Stack>
            {props.item &&
                <>
                    <Stack.Item styles={titleStackStyles} tokens={stackItemPadding}>
                        <Text block variant="xLarge">{name}</Text>
                        <Text variant="small">{description}</Text>
                    </Stack.Item>
                    <Stack.Item tokens={stackItemMargin}>
                        <TextField label="Name" placeholder="Item name" required value={name} onChange={(_e, value) => setName(value || '')} />
                        <TextField label="Description" placeholder="Item description" multiline size={20} value={description || ''} onChange={(_e, value) => setDescription(value)} />
                        <Dropdown label="State" options={todoStateOptions} required selectedKey={state} onChange={onStateChange} />
                        <DatePicker label="Due Date" placeholder="Due date" value={dueDate} onSelectDate={onDueDateChange} />
                        <TimePicker 
                            label="Due Time" 
                            placeholder="Due time" 
                            value={dueTime} 
                            onChange={onDueTimeChange}
                            useHour12={true} 
                        />
                    </Stack.Item>
                    <Stack.Item tokens={stackItemMargin}>
                        <Stack horizontal tokens={stackGaps}>
                            <PrimaryButton text="Save" onClick={saveTodoItem} />
                            <DefaultButton text="Cancel" onClick={cancelEdit} />
                        </Stack>
                    </Stack.Item>
                </>
            }
            {!props.item &&
                <Stack.Item tokens={stackItemPadding} style={{ textAlign: "center" }} align="center">
                    <FontIcon iconName="WorkItem" style={{ fontSize: 24, padding: 20 }} />
                    <Text block>Select an item to edit</Text>
                </Stack.Item>}
        </Stack >
    );
}

export default TodoItemDetailPane;