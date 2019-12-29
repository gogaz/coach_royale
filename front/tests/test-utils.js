import "regenerator-runtime/runtime";
import "@testing-library/jest-dom/extend-expect"

import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import mock from "./axiosMock";
import { ConstantsProvider, loadConstants } from "../src/helpers/constants";

const reactTestingLibrary = require('@testing-library/react');

window.GLOBAL_rootURL = "/clan/ABCD";
window.GLOBAL_mainClan = "ABCD";

mock.onGet('/constants/arenas.json').reply(200, [])
const constants = loadConstants();

const AllTheProviders = ({ children }) => (
    <ConstantsProvider value={ constants }>
        <ThemeProvider theme={ { colors: {}, breakpoints: {} } }>
            <MemoryRouter>
                { children }
            </MemoryRouter>
        </ThemeProvider>
    </ConstantsProvider>
);

function customRender(node, options) {
    return reactTestingLibrary.render(node, {wrapper: AllTheProviders, ...options});
}

module.exports = {
    ...reactTestingLibrary,
    render: customRender,
    mock,
};