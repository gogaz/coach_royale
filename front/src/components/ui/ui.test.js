import React from 'react';
import { expect } from 'chai';
import Enzyme, { render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Loading from './Loading';
import ClashRoyaleStat from './ClashRoyaleStat';

let { describe, it} = global;

Enzyme.configure({ adapter: new Adapter() });

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

describe('<Loading />', () => {
    it('renders loading.svg image', () => {
        const wrapper = render(<Loading/>);
        expect(wrapper.html()).to.contain('svg');
    });
    it('renders a single img when `height` is passed', () => {
        const wrapper = render(<Loading height={10}/>);
        expect(wrapper.find('div')).to.have.lengthOf(0);
    })
});

describe('<ClashRoyaleStat/>', () => {
    it('displays given title and value', () => {
        const wrapper = render(<ClashRoyaleStat title="the_title" value="the_value"/>);
        expect(wrapper.find('.title').text().trim()).to.equal('the_title');
        expect(wrapper.find('.value').text().trim()).to.equal('the_value');
    });
    it('formats int values to en-us by default', () => {
        const wrapper = render(<ClashRoyaleStat title="" value={9999}/>);
        expect(wrapper.find('.value').text().trim()).to.equal('9,999');
    });
    it('is able to format without locale', () => {
        const wrapper = render(<ClashRoyaleStat title="" value={9999} localeString=""/>);
        expect(wrapper.find('.value').text().trim()).to.equal('9999');
    })
});