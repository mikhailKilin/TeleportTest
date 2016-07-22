import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, IndexLink, browserHistory } from 'react-router'

import '../public/styles/login/main.scss'
import '../public/styles/cinema/main.scss'
import '../public/styles/shared/main.scss'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin'

import Root from './components/Root/Index'
import Login from './components/Login/Index';
import Cinema from './components/Cinema/Index'

injectTapEventPlugin()

ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router history={browserHistory}>
            <Route path="/" component={Root}>
                <Route path="login" component={Login}/>
                <Route path="cinema" component={Cinema}/>
            </Route>
        </Router>
    </MuiThemeProvider>
    ,
    document.getElementById('app')
);

