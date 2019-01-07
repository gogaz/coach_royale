import React from 'react';
import { shallow } from '../../enzyme';
import Loading from './Loading';
import ClashRoyaleStat from './ClashRoyaleStat';

let { describe, it, expect } = global;

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

describe('Loading tests', () => {
    it('renders loading.svg image', () => {
        const wrapper = shallow(<Loading/>);
        expect(wrapper.html()).toContain('svg');
        expect(wrapper.find('img')).toHaveLength(1);
    });
    it('renders a single img when `height` is passed', () => {
        const wrapper = shallow(<Loading height={10}/>);
        expect(wrapper.find('div')).toHaveLength(0);
    })
});

describe('ClashRoyaleStat tests', () => {
    it('displays given title and value', () => {
        const wrapper = shallow(<ClashRoyaleStat title="the_title" value="the_value"/>);
        expect(wrapper.find('.title').text().trim()).toBe('the_title');
        expect(wrapper.find('.value').text().trim()).toBe('the_value');
    });
    it('formats int values to en-us by default', () => {
        const wrapper = shallow(<ClashRoyaleStat title="" value={9999}/>);
        expect(wrapper.find('.value').text().trim()).toBe('9,999');
    });
    it('is able to format without locale', () => {
        const wrapper = shallow(<ClashRoyaleStat title="" value={9999} localeString=""/>);
        expect(wrapper.find('.value').text().trim()).toBe('9999');
    })
});