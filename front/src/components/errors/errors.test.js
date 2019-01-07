import React from 'react';
import { shallow } from '../../enzyme';
import CriticalError from "./CriticalError";

let { describe, it, expect } = global;

describe('<CriticalError/>', () => {
    it('has all necessary elements', () => {
        const wrapper = shallow(<CriticalError/>);
        expect(wrapper.find('h1')).toHaveLength(1);
        expect(wrapper.find('h4')).toHaveLength(1);
    });
    it('displays an error 500 as default', () => {
        const wrapper = shallow(<CriticalError />);
        expect(wrapper.find('h1').text()).toBe("500");
    });
    it('displays a description if provided', () => {
        const wrapper = shallow(<CriticalError message="Hello world"/>);
        expect(wrapper.find('p').text()).toBe("Hello world");
    })
});