import React from 'react'
import { Route, Switch } from 'react-router'
import '../../app/style.css'
import Home from '../home'
class Main extends React.Component {

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Home} />
                </Switch>
            </div>
        )
    }
}
export default Main