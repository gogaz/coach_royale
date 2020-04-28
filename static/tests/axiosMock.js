import axios from 'axios';
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

export default mock;