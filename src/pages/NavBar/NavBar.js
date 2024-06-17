import './NavBar.css';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Manager } from '../../Manager';
import LoginRegister from '../LoginRegister/LoginRegister';
import Account from '../Account/Account';

function NavBar({ toggle, toggled, hide, toggleAccount, hideAccount, accountToggled }) {
    const { changePageState, loginState, changeChannelName, changeChannelDesc } = useContext(Manager);

    function clickHandler() {
        if (loginState === "") {
            hideAccount();
            toggle();
        }
        else {
            hide();
            toggleAccount();
        }
    }

    return (
        <div className="NavBarBox">
            <div className="ButtonContainer">
                <h1><Link className='Logo' 
                onClick={() => {
                    changeChannelName("");
                    changeChannelDesc("");
                    changePageState("landing");
                    }}>BugHunt<img src={require("../../bug.png")} alt="bug"/></Link></h1>
                {loginState === "" ? <button className="Account" onClick={toggle}>Login/Register</button> 
                : <button className="Account" onClick={clickHandler}>Account</button>}
                {toggled && loginState === "" && <LoginRegister/>}
                {accountToggled && loginState !== "" && <Account/>}
            </div>
        </div>
    )
}

export default NavBar;