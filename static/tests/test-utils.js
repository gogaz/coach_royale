import "regenerator-runtime/runtime";
import "@testing-library/jest-dom/extend-expect"

import React from 'react'
import { Router as Router } from 'react-router-dom'
import { createMemoryHistory } from 'history';
import { ThemeProvider } from 'styled-components'
import mock from './axiosMock'
import ConstantsProvider from '../app/helpers/constants'
import App from '../app/components/App'

const reactTestingLibrary = require('@testing-library/react');

window.GLOBAL_rootURL = "/clan/ABCD";
window.GLOBAL_mainClan = "ABCD";

const AllTheProviders = ({ children }) => (
    <ConstantsProvider>
        <ThemeProvider theme={ { colors: {}, breakpoints: {} } }>
            { children }
        </ThemeProvider>
    </ConstantsProvider>
);

const customRender = (route, mockedData, options)  => {
    // mock provided data
    Object.keys(mockedData).map((url) => mock.onGet(url).reply(mockedData[url].code, mockedData[url].response));
    // render the component with given route and options
    const history = createMemoryHistory();
    history.push(route);
    return reactTestingLibrary.render(
        (
            <Router history={ history }>
                <App/>
            </Router>
        ),
        {
            wrapper: AllTheProviders,
            route,
            ...options
        }
    );
}

jest.mock('react-chartjs-2', () => ({
    Bar: ({ options: { title: { text } } }) => <span role="chart">{text}</span>,
    Line: ({ options: { title: { text } } }) => <span role="chart">{text}</span>,
    Doughnut: ({ options: { title: { text } } }) => <span role="chart">{text}</span>,
}));

module.exports = {
    ...reactTestingLibrary,
    render: customRender,
    mock,
};