import * as Sentry from '@sentry/react';

const init = () => {
    window.GLOBAL_sentryDSN && Sentry.init(
        {dsn: window.GLOBAL_sentryDSN}
    );
}

export default init;