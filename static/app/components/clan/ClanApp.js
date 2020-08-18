import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { setTitle } from 'helpers/browser';
import { useAutoFetch } from 'hooks/useAxios'
import Loading from 'components/ui/Loading'
import { Card } from 'components/ui/Card'
import ClanPage from './ClanPage'
import ClanDetails from './ClanDetails'

const ClanList = ({ match }) => {
    setTitle("All known clans");
    const { loading, response: data } = useAutoFetch('/api/clan/all')

    if (loading) return <Loading />;

    return (
        <React.Fragment>
            <Card><ClanDetails tag={data.main} /></Card>
            { data.family.map((tag) => (
                <Card key={tag}><ClanDetails tag={tag} /></Card>
            ))}
        </React.Fragment>
    );
};

const ClanApp = ({ match }) => (
    <div>
        <Switch>
            <Route
                exact
                path={ match.url + "/" }
                render={ (props) => <ClanList { ...props } /> }
            />
            <Route path={ match.url + "/:tag" } component={ ClanPage }/>
        </Switch>
    </div>
);

export default ClanApp