import React from 'react'
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class TopBar extends React.Component {
    render() {
        return (
            <header className="app-header navbar">
                <a className="navbar-brand" href="/"> </a>
                { this.props.user && (
                    <ul className="nav navbar-nav ml-auto">
                        { /*
                        <li class="nav-item d-md-down-none">
                            <a class="nav-link" href="#">
                                <i class="icon-bell"></i><span class="badge badge-pill badge-danger">5</span>
                            </a>
                        </li>
                        <li class="nav-item d-md-down-none">
                            <a class="nav-link" href="#"><i class="icon-list"></i></a>
                        </li>
                        <li class="nav-item d-md-down-none">
                            <a class="nav-link" href="#"><i class="icon-location-pin"></i></a>
                        </li>
                        */ }
                        <li className="nav-item d-md-down-none">
                            <button className="navbar-toggler aside-menu-toggler" type="button">
                                <span className="nav-link">{ this.props.user.username }</span>
                            </button>
                        </li>
                    </ul>) }
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item px-3">
                        <Link to={'/login'} className="nav-link"><FontAwesomeIcon icon={"sign-in-alt"}/> Login</Link>
                    </li>
                </ul>
            </header>)
    }
}