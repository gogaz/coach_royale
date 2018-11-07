import React from 'react';
import { FontAwesomeIcon } from "./FontAwesome";

export default class TopBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-dark bg-dark">
                <a className="navbar-brand" href="#">
                    <img src="/img/logo_name_beside.png" height="30" alt=""/>
                </a>


                <ul className="navbar-nav mr-2">
                    <li className="nav-item"><a href="/tournaments" className="nav-link"><FontAwesomeIcon icon="dice"/> Tournaments</a></li>
                </ul>

                {/*<span className="my-2 my-lg-0">
                    <Link to={'/login'} className="nav-link"><FontAwesomeIcon icon={"sign-in-alt"}/> Login</Link>
                </span>*/}
            </nav>
        )
    }
}