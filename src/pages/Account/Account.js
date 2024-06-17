import "./Account.css";
import React, { useContext, useState, useEffect } from "react";
import { Manager } from "../../Manager";

function Account() {
    const { logout, changePageState, loginState } = useContext(Manager);
    const [rank, setRank] = useState("");
    const [userStats, setUserStats] = useState(0);

    function tryLogout() {
        fetch('http://localhost:8080/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    
        .then(response => {
            if (!response.ok) {
                console.log("Server error during logout");
            }
            else {
                console.log("Logout successful");
                logout();
                changePageState("landing");
            }
        });
    }

    function getUserStats() {
        return fetch("http://localhost:8080/getUserStats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: loginState })
        })
        .then((response) => {
            if (!response.ok) {
                console.log("Unexpected server error during user stats retrieval.");
                return [];
            }
            return response.json();
        })

        .then((data) => {setUserStats(data);});
    }

    useEffect(() => {
        getUserStats(loginState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginState]);

    useEffect(() => {
        let userRankNum = userStats.posts + userStats.likes;
        if (userRankNum < 10) setRank("Novice Gatherer");
        else if (userRankNum < 25) setRank("Apprentice Gatherer");
        else if (userRankNum < 50) setRank("Expert Gatherer");
        else if (userRankNum < 100) setRank("Novice Hunter");
        else if (userRankNum < 175) setRank("Apprentice Hunter");
        else if (userRankNum < 500) setRank("Expert Hunter");
        else setRank("Legendary Hunter");
    }, [userStats]);

    return (
        <div className="AccountPage">
            <h1>Hello, {loginState}!</h1>
            <h2>Rank {userStats.likes + userStats.posts} - {rank}</h2>
            <button onClick={tryLogout} className="Logout">Logout</button>
        </div>
    )
}

export default Account;