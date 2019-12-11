import React from 'react';
import { shallow } from '../../enzyme';
import nock from 'nock';
import Loading from './Loading';
import ClashRoyaleStat from './ClashRoyaleStat';
import FontAwesomeIcon from "./FontAwesome";
import LastRefreshInfo from "./LastRefreshInfo";

let { describe, it, expect } = global;

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

describe('<Loading>', () => {
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

describe('<ClashRoyaleStat>', () => {
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

describe('<FontAwesomeIcon>', () => {
    it('renders an <i/> with given icon', () => {
        const wrapper = shallow(<FontAwesomeIcon icon='home'/>);
        expect(wrapper.containsMatchingElement(<i/>)).toEqual(true);
    });
    it('can spin', () => {
        const wrapper = shallow(<FontAwesomeIcon icon='home' spin/>);
        expect(wrapper.find('i.fa-spin')).toHaveLength(1);
    });
    it('can pulse', () => {
        const wrapper = shallow(<FontAwesomeIcon icon='home' pulse/>);
        expect(wrapper.find('i.fa-pulse')).toHaveLength(1);
    });
    it('can rotate', () => {
        const wrapper = shallow(<FontAwesomeIcon icon='home' rotate={90}/>);
        expect(wrapper.find('i.fa-rotate-90')).toHaveLength(1);
    });
    it('can flip', () => {
        const wrapper = shallow(<FontAwesomeIcon icon='home' flip={'vertical'}/>);
        expect(wrapper.find('i.fa-flip-vertical')).toHaveLength(1);
    });
    it('can be scaled', () => {
        const wrapper90 = shallow(<FontAwesomeIcon icon='home' scale={3}/>);
        expect(wrapper90.find('i.fa-3x')).toHaveLength(1);
    });
});

describe('<LastRefreshInfo>', () => {
    beforeAll(() => {
        nock('http://example.com')
            .get('/')
            .reply(200, {valid: true})
    });
    it('gives informations based on datetime in ISO-8601 format', () => {
        const wrapper = shallow(<LastRefreshInfo time={'1977-04-22T06:00:00Z'}/>);
        expect(wrapper.find('.last-refresh-info>.text-muted').text().trim()).toMatch(/Last refresh (.+) ago/)
    });
    it('can display a button to refresh data', () => {
        const wrapper = shallow(<LastRefreshInfo refreshable url={'http://example.com/'} handleData={() => {}}/>);
        expect(wrapper.find('button[hidden=false]')).toHaveLength(1);
    });
});