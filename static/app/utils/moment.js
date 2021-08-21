import { locale } from './browser'
const moment = require('moment-shortformat');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);

export default moment;
