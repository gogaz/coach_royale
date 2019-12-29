import React, { useEffect, useState } from "react"
import axios from "axios";
import { Route, Switch } from "react-router-dom";
import ClanPage from "./ClanPage";
import { handleErrors } from "../../helpers/api";
import { setTitle } from "../../helpers/browser";
import Loading from "../ui/Loading";

const ClanList = ({ endpoint }) => {
    const [loading, setIsLoading] = useState(true);
    const [clans, setClans] = useState([]);

    useEffect(() => {
            axios.get(endpoint)
                .then(result => handleErrors(result))
                .then(result => {
                    setClans(result);
                    setIsLoading(false);
                })
                .catch(error => console.log(error))
        },
        []
    );
    setTitle("All known clans");
    if (loading) return <ul><li><Loading/></li></ul>;

    return (
        <ul>
            { clans.map((e, key) => <li key={ key }>{ e }</li>) }
        </ul>
    );
};

const ClanApp = ({ match, mainClan }) => (
    <div>
        <Switch>
            <Route exact path={ match.url + "/" } render={ (props) => <ClanList { ...props } mainClan={ mainClan }/> }/>
            <Route path={ match.url + "/:tag" } component={ ClanPage }/>
        </Switch>
    </div>
);

export default ClanApp