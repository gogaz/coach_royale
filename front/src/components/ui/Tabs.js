import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Link, Redirect, Route, Switch} from "react-router-dom";

class Tabs extends Component {
    render() {
        const {children, match} = this.props;
        let baseUrl = match.url;
        let my_children = React.Children.toArray(children);

        return (
            <div className="tabs">
                <ul className="nav nav-tabs">
                    {my_children.map(child => {
                        let classes = ['nav-link'];
                        if (child.props.match && child.props.match.url === baseUrl) classes = [...classes, 'active'];
                        return (
                            <li className="nav-item" key={child.props.id}>
                                <Link to={match.url + '/' + child.props.id} className={classes.join(' ')}>{child.props.label}</Link>
                            </li>
                        )
                    })}
                </ul>
                <div className="tab-content">
                    <Switch>
                        <Route exact path={match.url} component={() => <Redirect to={baseUrl + '/' + my_children.find(e => e.props.default === true).props.id} />} />
                        {my_children.map((child) => <Route key={child.props.id} path={baseUrl + '/' + child.props.id} component={() => child} />)}
                    </Switch>
                </div>
            </div>
        );
    }
}

class Tab extends Component {
    render() {
        return (
            <div className="tab-pane active" key={this.props.id}>
                {this.props.children}
            </div>
        )
    }
}
Tab.defaultProps = {
    default: false,
};
Tab.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    default: PropTypes.bool,
};

export { Tab, Tabs }