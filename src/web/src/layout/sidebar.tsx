import { FC, ReactElement } from 'react';
import { IStackStyles, Stack } from '@fluentui/react';
import TodoListMenu from '../components/todoListMenu';
import { TodoList } from '../models/todoList';

interface SidebarProps {
    selectedList?: TodoList
    lists?: TodoList[];
    onListCreate: (list: TodoList) => void
}

const sidebarContentStyles: IStackStyles = {
    root: {
        height: '100%',
        background: 'transparent',
        padding: '10px 0'
    }
}

const Sidebar: FC<SidebarProps> = (props: SidebarProps): ReactElement => {
    return (
        <Stack styles={sidebarContentStyles}>
            <TodoListMenu
                selectedList={props.selectedList}
                lists={props.lists}
                onCreate={props.onListCreate} />
        </Stack>
    );
};

export default Sidebar;