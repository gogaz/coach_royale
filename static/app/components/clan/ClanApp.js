import React, { useEffect, useState } from "react"
import axios from "axios";
import { Route, Switch } from "react-router-dom";
import ClanPage from "./ClanPage";
import { handleErrors } from "../../helpers/api";
import { setTitle } from "../../helpers/browser";
import Loading from "../ui/Loading";
import { Card, Header } from "../ui/Card";
import ClanDetails from "./ClanDetails";

const ClanList = ({ match }) => {
    const [loading, setIsLoading] = useState(true);
    const [clans, setClans] = useState({});

    useEffect(() => {
            axios.get('/api/clan/all')
                .then(result => handleErrors(result))
                .then(result => {
                    console.log(result);
                    setClans(result);
                    setIsLoading(false);
                })
                .catch(error => console.log(error))
        },
        []
    );
    setTitle("All known clans");
    if (loading) return <Loading />;

    return (
        <React.Fragment>
            <Card><ClanDetails tag={clans.main} /></Card>
            { clans.family.map((tag) => (
                <Card key={tag}><ClanDetails tag={tag} /></Card>
            ))}
        </React.Fragment>
    );
};

const ClanApp = ({ match, mainClan }) => (
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