import { useReducer, FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './layout/layout';
import './App.css';
import './styles/pinkTheme.css';
import { SoftPinkTheme } from './ux/softPinkTheme';
import { AppContext, ApplicationState, getDefaultState } from './models/applicationState';
import appReducer from './reducers';
import { TodoContext } from './components/todoContext';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { ThemeProvider } from '@fluentui/react';
import Telemetry from './components/telemetry';
import PomodoroTimer from './components/PomodoroTimer';

initializeIcons(undefined, { disableWarnings: true });

const App: FC = () => {
  const defaultState: ApplicationState = getDefaultState();
  const [applicationState, dispatch] = useReducer(appReducer, defaultState);
  const initialContext: AppContext = { state: applicationState, dispatch: dispatch }

  return (
    <ThemeProvider applyTo="body" theme={SoftPinkTheme}>
      <TodoContext.Provider value={initialContext}>
        <BrowserRouter>
          <Telemetry>
            <Layout />
            <PomodoroTimer />
          </Telemetry>
        </BrowserRouter>
      </TodoContext.Provider>
    </ThemeProvider>
  );
};

export default App;
