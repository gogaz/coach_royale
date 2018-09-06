import React from 'react'
import Loading from "../ui/Loading";
import ClanDetails from "./ClanDetails";
import ClanMembers from "./ClanMembers";

export default class ClanPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clanError: null,
            clanLoaded: false,
            clan: {},
            endPoint: "/api/clan/" + props.match.params.tag,
        }
    }

    componentDidMount() {
        fetch(this.state.endPoint)
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(result);
                    this.setState({ clanLoaded: true, clan: result });
                })
            .catch((error) => {
                this.setState({ clanLoaded: true, clanError: error });
                console.log(error);
            });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header" hidden={this.state.clanLoaded}>
                    <Loading loading={ !this.state.clanLoaded } />
                </div>
                { this.state.clanLoaded && <ClanDetails clan={this.state.clan} /> }
                <div className="card-body">
                    <ClanMembers endpoint={this.state.endPoint} />
                </div>
            </div>
        );
    }
}