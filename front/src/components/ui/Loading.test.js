import React from 'react';
import {expect} from 'chai';
import {render} from 'enzyme';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import Loading from './Loading';

describe('<Loading />', () => {
    it('renders loading.svg image', () => {
        const wrapper = render(<Loading/>);
        expect(wrapper.html()).to.contain('svg');
    });
    it('renders only an img when `height` is passed', () => {
        const wrapper = render(<Loading height={10}/>);
        expect(wrapper.find('div')).to.have.lengthOf(0);
    })
});