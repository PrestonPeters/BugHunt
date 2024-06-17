import './ViewPost.css';
import './ViewPosts.js';
import React, { useContext, useState } from 'react';
import { Manager } from '../../Manager';
import ViewReplies from './ViewReplies.js';
import UserView from './UserView.js';

function ViewPost() {
    const { channelName, changePageState, changeChannelName, changeChannelDesc, 
        managerPostTopic, managerPostData, managerPostTime, managerPostUser, managerPostID } = useContext(Manager);
    const [openReplyBox, setOpenReplyBox] = useState(-1);

    function backToChannel() {
        console.log("Back to channel!");
        changeChannelName(channelName);
        getChannelDesc(channelName)
        .then((desc) => {
            changeChannelDesc(desc);
            changePageState("viewCh");
            window.location.reload();
        });
    }

    async function getChannelDesc(channelName) {
        const response = await fetch("http://localhost:8080/getDesc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chName: channelName })
        });
        if (!response.ok) {
            console.log("Unexpected server error during channel description retrieval.");
            return Promise.reject("Unexpected server error during channel description retrieval.");
        }
        const data = await response.json();
        return data.desc;
    }

    function showReplyBox(postID) {
        setOpenReplyBox(postID);
    }

    function hideReplyBox() {
        setOpenReplyBox(-1);
    }

    function stub() {console.log("Stub function");}

    return (
        <div className="RightPane">
            <div className="ViewPostBox">
                <button className="BackToChannel" 
                onClick={backToChannel}>Back to {channelName}</button>
                <div className="ViewPostUpper">
                    <h1>{managerPostTopic}</h1>
                    <div className="ViewPostHeading"><p>Posted in {channelName} at {managerPostTime} by </p><UserView user={managerPostUser} refresh={backToChannel}/></div>
                    <p className="CurrentPostDataPortion">{managerPostData}</p>
                    <ViewReplies postID={managerPostID} showReplyBox={showReplyBox} hideReplyBox={hideReplyBox} 
                    postUser={managerPostUser} openReplyBox={openReplyBox} backToChannel={backToChannel} toggleFetchAgain={stub}/>
                </div>
            </div>
        </div>
    )
}

export default ViewPost;