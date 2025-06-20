import { createContext } from "react";
import { AppContext, getDefaultState } from "../models/applicationState";

export const TodoContext = createContext<AppContext>({
    state: getDefaultState(),
    dispatch: () => { return }
});