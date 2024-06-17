import './ViewChannel.css';
import React, { useContext, useState, useEffect } from 'react';
import { Manager } from '../../Manager';
import LoginWarning from '../LoginWarning/LoginWarning';
import ViewPosts from '../ViewPost/ViewPosts';

function ViewChannel() {
    const { loginState, changePageState, channelName, channelDesc, toggleFetchChannelsAgain } = useContext(Manager);
    const [loginWarning, setLoginWarning] = useState(false);
    const [subscribed, setSubscribed] = useState(() => {
        if (loginState === "") return false;
        return checkIfSubscribed();
    });

    useEffect(() => {
        if (loginWarning) document.addEventListener("mousedown", () => setLoginWarning(false));
        else document.removeEventListener("mousedown", () => setLoginWarning(false));
    }, [loginWarning]);

    function trySubscribe() {
        console.log("TRYING TO SUBSCRIBE");
        setLoginWarning(false);
        if (loginState === "") {
            setLoginWarning(true);
            return;
        }

        fetch("http://localhost:8080/subscribe", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelName: channelName, userID: loginState })
        })

        .then(res => {
            if (res.status === 200) {
                setSubscribed(true);
                toggleFetchChannelsAgain();
            }
            else {
                console.log("Database error during subscription");
                return;
            }
        });
    }

    function tryUnsubscribe() {
        fetch("http://localhost:8080/unsubscribe", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelName: channelName, userID: loginState })
        })

        .then(res => {
            if (res.status === 200) {
                setSubscribed(false);
                toggleFetchChannelsAgain();
            }
            else {
                console.log("Database error during unsubscription");
                return;
            }
        });
    }

    function checkIfSubscribed() {
        fetch("http://localhost:8080/isSubscribed", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ channelName: channelName, userID: loginState })
        })

        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            else {
                console.log("Database error during subscription check.");
                return;
            }
        })

        .then(data => {setSubscribed(data.isSubscribed === "y");});
    }

    async function deleteChannel() {
        let allPosts = await fetch("http://localhost:8080/getPosts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelNames: [channelName] })
        })

        .then(response => {
            if (!response.ok) {
                console.log("Unexpected server error during post retrieval.");
                return;
            }
            else return response.json();
        })

        await fetch("http://localhost:8080/deletePost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postIDs: allPosts.posts.map((post) => {return post.id}), 
            usernames: allPosts.posts.map((post) => {return post.username}) })
        });

        await fetch("http://localhost:8080/deleteChannel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelName: channelName })
        });

        toggleFetchChannelsAgain();
        changePageState("landing");
    }

    useEffect(() => {
        if (loginState === "") setSubscribed(false);
        checkIfSubscribed();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName, loginState]);

    return (
        <div className="RightPane">
            {loginWarning && <LoginWarning/>}
            <div className="ChannelView">
                <div className="ViewHeader">
                    <div className="ChannelViewHeader"><h1>Welcome to {channelName}</h1></div>
                    <div className="ViewChannelButtonBox">
                        <button className="CreatePostButton" onClick={() => changePageState("createPo")}>Create Post</button>
                        {(loginState !== "" && !subscribed && <button className="SubscribeButton" onClick={trySubscribe}>Subscribe</button>) ||
                        (loginState !== "" && subscribed && <button className="SubscribeButton" onClick={tryUnsubscribe}>Unsubscribe</button>)}
                        {loginState === "admin" && <button className="DeleteButton" onClick={() => deleteChannel()}>Delete Channel</button>}
                    </div>
                </div>
                <div className="ChannelDescription">
                    <h2>Channel Description</h2>
                    {channelDesc}
                </div><br></br><br></br>

                {<ViewPosts postChannelList={[channelName]} postSubChannelList={[channelName]} landingPage={false}/>}

            </div>
        </div>
    )
}

export default ViewChannel;