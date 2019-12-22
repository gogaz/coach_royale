// re-export everything
import '@testing-library/jest-dom/extend-expect'
const reactTestingLibrary = require('@testing-library/react');

import mock from "./axiosMock";

window.GLOBAL_rootURL = "/clan/ABCD";
window.GLOBAL_mainClan = "ABCD";

module.exports = {
    ...reactTestingLibrary,
    mock,
};