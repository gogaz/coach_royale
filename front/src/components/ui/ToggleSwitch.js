import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import _ from 'underscore';
import './css/ToggleSwitch.css';

export default class ToggleSwitch extends Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked
        };
        this.toggleSwitch = this.toggleSwitch.bind(this);
        this.getCheckedState = this.getCheckedState.bind(this)
    }
    componentWillMount() {
        this.setState({checked: this.getCheckedState()});
    }
    getCheckedState() {
        let {checked} = this.props;
        checked = _.isFunction(checked) ? checked() : checked;
        // Return checked if it is a boolean, otherwise false
        return _.isBoolean(checked) && checked;
    }
    toggleSwitch(evt) {
        evt.persist();
        evt.preventDefault();

        const {onClick, onStateChanged} = this.props;

        this.setState({checked: !this.state.checked}, () => {
            const state = this.state;

            // Augument the event object with SWITCH_STATE
            const switchEvent = Object.assign(evt, {SWITCH_STATE: state});

            // Execute the callback functions
            _.isFunction(onClick) && onClick(switchEvent);
            _.isFunction(onStateChanged) && onStateChanged(state);
        });
    }

    render() {
        const {checked} = this.getCheckedState();

        // Isolate special props and store the remaining as restProps
        const {theme, className, ...restProps} = this.props;

        // Use default as a fallback theme if valid theme is not passed
        const switchTheme = (theme && _.isString(theme)) ? theme : 'default';

        const switchClasses = classnames("switch", "switch-wrapper", className);
        const togglerClasses = classnames(
            'switch-toggle',
            `${checked ? 'on' : 'off'}`
        );

        return (
            <div className="switch switch-wrapper" onClick={this.toggleSwitch} {...restProps}>
                <div className={togglerClasses}/>
            </div>
        )
    }

}

ToggleSwitch.propTypes = {
    theme: PropTypes.string,
    checked: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    onStateChanged: PropTypes.func
};
