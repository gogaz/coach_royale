import React from "react"
import { Route, Switch } from "react-router-dom";
import ClanPage from "./ClanPage";
import { setTitle, useFetch } from "../../helpers/browser";
import Loading from "../ui/Loading";
import { Card, Header } from "../ui/Card";
import ClanDetails from "./ClanDetails";

const ClanList = ({ match }) => {
    setTitle("All known clans");
    const { loading, data } = useFetch('/api/clan/all')

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