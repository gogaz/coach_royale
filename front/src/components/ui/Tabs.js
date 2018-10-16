import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect, Route, Switch } from "react-router-dom";

class Tabs extends Component {
    constructor(props) {
        super(props);

        const children = React.Children.toArray(props.children);
        this.state = {
            children:  children,
            defaultElement: children.find(e => e.props.default === true) || children[0],
            selected: null,
        };

        this.getActiveComponent = this.getActiveComponent.bind(this);
    }
    componentWillReceiveProps(newProps) {
        const children = React.Children.toArray(newProps.children);
        this.setState({
            children: children,
            defaultElement: children.find(e => e.props.default === true),
        })
    }
    getActiveComponent(props) {
        const id = props.match.params.tab;
        if (this.state.selected !== id)
            this.setState({selected: id});
        return this.state.children.find(e => e.props.id === id)
    }
    render() {
        const {match} = this.props;
        const {children, defaultElement} = this.state;
        let selected = this.state.selected || defaultElement ? defaultElement.props.id : null;
        let baseUrl = match.url;

        return (
            <div className="tabs">
                <ul className="nav nav-tabs">
                    {children.map(child => {
                        let classes = ['nav-link'];
                        if (selected === child.props.id) classes = [...classes, 'active'];
                        return (
                            <li className="nav-item" key={child.props.id}>
                                <Link to={match.url + '/' + child.props.id} className={classes.join(' ')}>{child.props.label}</Link>
                            </li>
                        )
                    })}
                </ul>
                <div className="tab-content">
                    <Switch>
                        {defaultElement && <Route exact path={baseUrl} component={() => <Redirect to={`${baseUrl}/${selected}`} />}/>}
                        <Route path={baseUrl + '/:tab'} render={this.getActiveComponent}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
Tabs.propTypes = {
    children: PropTypes.node.isRequired,
};

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
    children: PropTypes.node,
    default: PropTypes.bool,
};

export { Tab, Tabs }