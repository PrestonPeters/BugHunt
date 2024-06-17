import React, { useEffect, useState, useContext } from 'react';
import './UserView.css';
import DeleteUser from './DeleteUser.js';
import { Manager } from '../../Manager';

function UserView({user, refresh}) {
    const [userStats, setUserStats] = useState({});
    const [rank, setRank] = useState("");
    const [userStatsVisible, setUserStatsVisible] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const { loginState } = useContext(Manager);

    async function getUserStats(user) {
        return fetch("http://localhost:8080/getUserStats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user })
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
        if (isDeleted) return;
        getUserStats(user);
    }, [user, isDeleted]);

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

    function showUserStats() {
        getUserStats(user);
        setUserStatsVisible(true);
    }

    function hideUserStats() {
        setUserStatsVisible(false);
    }

    function tryDeleteUser() {
        console.log("Deleting user " + user);
        setIsDeleted(true);
        DeleteUser({username: user, refresh: refresh});
    }

    if (isDeleted) return (null);

    return (
        <div className="UserView" onMouseEnter={showUserStats} onMouseLeave={hideUserStats}>
            <p>{user}</p>
                {userStatsVisible && <div className="UserStats">
                    <p className='NoSpace'>{user}</p>
                    <p className='NoSpace'>{rank}</p>
                    <p className='NoSpace'>Posts/Replies: {userStats.posts}</p>
                    <p className='NoSpace'>Likes: {userStats.likes}</p>
                    {loginState === "admin" && user !== "admin" && <button className="DeleteButton" onClick={() => {
                        hideUserStats();
                        tryDeleteUser();
                        }}>Delete User</button>}
                </div>}
        </div>
    )
}

export default UserView;