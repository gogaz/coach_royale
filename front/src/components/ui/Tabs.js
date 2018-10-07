import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tabs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: this.props.children[ 0 ].props.id,
        };
        this.onClickTabItem = this.onClickTabItem.bind(this);
    }

    onClickTabItem() {
        this.setState({activeTab: tab});
    };

    render() {
        const {props: {children,}, state: {activeTab,}} = this;
        let my_children = React.Children.toArray(this.props.children);

        return (
            <div className="tabs">
                <ul className="nav nav-tabs">
                    {my_children.map(child => {
                        let classes = ['nav-link'];
                        if (child.props.id === activeTab) classes = [...classes, 'active'];
                        return (
                            <li className="nav-item" key={child.props.id}>
                                <a className={classes.join(' ')} data-toggle="tab" href="#" onClick={() => this.setState({activeTab: child.props.id})}>
                                    {child.props.label}
                                </a>
                            </li>
                        )
                    })}
                </ul>
                <div className="tab-content">
                    {my_children.map((child) => {
                        if (child.props.id !== activeTab) return undefined;
                        return (
                            <div className="tab-pane active" key={child.props.id}>
                                {child}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

class Tab extends Component {
    render() {
        return this.props.children
    }
}
Tab.propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    };

export { Tab, Tabs }