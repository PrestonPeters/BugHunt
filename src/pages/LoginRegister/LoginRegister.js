import React from "react";
import { useState, useContext, useEffect } from "react";
import "./LoginRegister.css";
import { Manager } from "../../Manager";

function LoginRegister() {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [regUser, setRegUser] = useState("");
    const [regPass, setRegPass] = useState("");
    const [regConfirm, setRegConfirm] = useState("");
    const [loginError, setLoginError] = useState(false);
    const [invalidError, setInvalidError] = useState(false);
    const [userTaken, setUserTaken] = useState(false);
    const [registerError, setRegisterError] = useState(false);
    const [mismatchError, setMismatchError] = useState(false);
    const [unfilled, setUnfilled] = useState(false);
    const [userTooShort, setUserTooShort] = useState(false);
    const [passTooShort, setPassTooShort] = useState(false);
    const { login } = useContext(Manager);

    function checkUserAvailable(regUsername) {
        if (regUser.length < 5) {
            setUserTaken(false);
            return;
        }
        fetch("http://localhost:8080/checkUsernameAvailable", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: regUsername })
        })

        .then(res => {
            if (res.status === 204) {
                setUserTaken(true);
                return;
            }
            setUserTaken(false);
        });
    }


    function tryLogin(e) {
        e.preventDefault();
        setLoginError(false);
        setInvalidError(false);
        
        if (user === "" || pass === "" || user.length < 5 || pass.length < 5) {
            setLoginError(true);
            return;
        }

        let username = user;
        let password = pass;
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })

        .then(response => {
            if (!response.ok) {
                setInvalidError(true);
                console.log("Database error during login");
            }

            else if (response.status === 204) {
                setInvalidError(true);
                console.log("Invalid username or password");
            }
            
            else return response.json();
        })

        .then(data => {if (data && data.loginState !== "") login(data.loginState)});
    }

    function tryRegister(e) {
        e.preventDefault();
        if (mismatchError || userTaken) return;
        setRegisterError(false);

        if (regUser === "" || regPass === "" || regConfirm === "" || 
        regUser.length < 5 || regPass.length < 5) {
            setUnfilled(true);
            return;
        }

        setUnfilled(false);

        let username = regUser;
        let password = regPass;
        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })

        .then(response => {
            if (!response.ok) {
                console.log("Database error during registration");
                setRegisterError(true);
            }
            else {
                console.log("Registration successful!");
                return response.json();
            }
        })

        .then(data => login(data.loginState));
    }

    const disallowRegex = /[^A-Za-z0-9-_]/;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {checkUserAvailable(regUser)}, [regUser]);

    useEffect(() => {
        if (regPass.length > 4 && regConfirm.length > 4) {
            if (regPass !== regConfirm) setMismatchError(true)
            else setMismatchError(false)
        }
    }, [regPass, regConfirm]);

    useEffect(() => {
        if (regUser.length !== 0 && regUser.length < 5) setUserTooShort(true)
        else setUserTooShort(false);
    }, [regUser]);

    useEffect(() => {
        if (regPass.length !== 0 && regPass.length < 5) setPassTooShort(true)
        else setPassTooShort(false);
    }, [regPass]);

    return (
        <div className="LogRegBox">
            <div className="Heading"><h1>Login/Register</h1></div>
            <div className="LogRegInnerBox">
                <div className="LogOuterBox">
                    <div className="LogInnerBox">
                        <form id="LogForm" className="LogForm">
                            <div className="LogHead"><h2>Login</h2></div>

                            <div>
                                <label htmlFor="username">Username*</label>
                                <input type="text" name="username" id="username" placeholder="Enter username..." maxLength={24} value={user} required autoComplete="username" spellCheck="false"
                                onChange={(e) => {if (!/\s/.test(e.target.value) || /\b/.test(e.target.value)) if (!disallowRegex.test(e.target.value)) setUser(e.target.value)}}/>
                            </div>

                            <div>
                                <label htmlFor="password">Password*</label>
                                <input type="password" name="password" id="password" placeholder="Enter password..." maxLength={24} value={pass} required autoComplete="current-password"
                                onChange={(e) => {if (!/\s/.test(e.target.value) || /\b/.test(e.target.value)) setPass(e.target.value)}}/>
                            </div>

                            <div className="ButtonDiv"><button type="submit" id="LogButton" className="LogButton" onClick={tryLogin}>Login</button></div>
                            {loginError && <p className="Error">*Please fill in required fields*</p>}
                            {invalidError && <p className="Error">*Invalid username or password*</p>}
                        </form>
                    </div>
                </div>

                <div className="RegOuterBox">
                    <div className="RegInnerBox">
                        <form id="RegForm" className="RegForm">
                            <div className="RegHead"><h2>Register</h2></div>

                            <div>
                                <label htmlFor="regUsername">Username*</label>
                                <input type="text" name="regUsername" id="regUsername" placeholder="Enter username..." minLength={5} maxLength={24} value={regUser} required autoComplete = "off" spellCheck="false"
                                onChange={(e) => {if (!/\s/.test(e.target.value) || /\b/.test(e.target.value)) if (!disallowRegex.test(e.target.value)) {setRegUser(e.target.value)}}}/>
                                {userTooShort && <p className="Error">*Min. 5 characters*</p>}
                                {userTaken && <p className="Error">*Username already taken*</p>}
                            </div>

                            <div>
                                <label htmlFor="regPassword">Password*</label>
                                <input type="password" name="regPassword" id="regPassword" placeholder="Enter password..." minLength={5} maxLength={24} value={regPass} required autoComplete="off"
                                onChange={(e) => {if (!/\s/.test(e.target.value) || /\b/.test(e.target.value)) setRegPass(e.target.value)}}/>
                                {passTooShort && <p className="Error">*Min. 5 characters*</p>}
                            </div>

                            <div>
                            <label htmlFor="confirm">Confirm Password*</label>
                                <input type="password" name="confirm" id="confirm" placeholder="Confirm password..." minLength={5} maxLength={24} value={regConfirm} required autoComplete="off"
                                onChange={(e) => {if (!/\s/.test(e.target.value) || /\b/.test(e.target.value)) setRegConfirm(e.target.value)}}/>
                                {mismatchError && <p className="Error">*Passwords do not match*</p>}
                            </div>

                            <div className="ButtonDiv"><button type="submit" id="RegButton" className="RegButton" onClick={tryRegister}>Register</button></div>
                            {unfilled && <p className="Error">*Please fill in required fields*</p>}
                            {registerError && <p className="Error">*Error during registration.*</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginRegister;