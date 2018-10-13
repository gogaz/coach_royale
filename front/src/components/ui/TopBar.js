import React from 'react'

export default class TopBar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-dark bg-dark">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <a className="navbar-brand" href="#">
                            <img src="/img/logo_name_beside.png"
                                 height="30"
                                 className="d-inline-block align-top" />
                        </a>
                    </li>
                </ul>
                {/*<span className="my-2 my-lg-0">
                    <Link to={'/login'} className="nav-link"><FontAwesomeIcon icon={"sign-in-alt"}/> Login</Link>
                </span>*/}
            </nav>
        )
    }
}