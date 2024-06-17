import React, { useState, useEffect, useContext } from "react";
import './ViewReplies.css';
import ReplyBox from './ReplyBox.js';
import LikeButton from './LikeButton.js';
import ImageRender from './ImageRender.js';
import { Manager } from "../../Manager";
import UserView from "./UserView.js";

function ViewReplies({ postID, postUser, showReplyBox, hideReplyBox, openReplyBox, backToChannel, toggleFetchAgain }) {
    const [replyList, setReplyList] = useState([]);
    const [showReplies, setShowReplies] = useState(true);
    const [image, setImage] = useState([]);
    const [imageVisible, setImageVisible] = useState([]);
    const [fetchReplies, setFetchReplies] = useState(false);
    const { loginState, managerPostID } = useContext(Manager);

    function convertToLocal(time) {
        const dateObject = new Date(time + "Z");
        const localYear = dateObject.getFullYear();
        const localMonth = dateObject.getMonth() + 1;
        const localDay = dateObject.getDate();
        const localHour = (dateObject.getHours() > 9 ? dateObject.getHours() : "0" + dateObject.getHours());
        const localMinute = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : "0" + dateObject.getMinutes());

        return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}`;
    }

    async function getReplies(ID) {
        return fetch("http://localhost:8080/getReplies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postID: ID })
        })
        
        .then(response => {
            if (!response.ok) console.log("Unexpected server error during reply retrieval.");
            else return response.json();
        })

        .then(data => {
            let formattedResult = data.replies;
            formattedResult.sort((a, b) => a.postID - b.postID);
            return formattedResult;
        });
    }

    async function getImage(postID) {
        return fetch("http://localhost:8080/getImages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postID: postID })
        })

        .then(response => {
            if (!response.ok) {
                console.log("Unexpected server error during image retrieval.");
                return Promise.reject("Unexpected server error during image retrieval.");
            }

            else return response.json();
        })

        .then(data => {return data});
    }

    useEffect(() => {
        getReplies(postID)
        .then((replies) => {
            setReplyList(replies);
        });

        getImage(postID)
        .then((images) => {
            setImage(images);
            if (images.images) {
                images.images.map((img, index) => {
                    setImageVisible(imageVisible => [...imageVisible, false]);
                    return null;
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchReplies]);

    function toggleImageVisible(index) {
        setImageVisible(imageVisible => {
            let newImageVisible = [...imageVisible];
            newImageVisible[index] = !newImageVisible[index];
            return newImageVisible;
        });
    }
    function hideImage(index) {
        setImageVisible(imageVisible => {
            let newImageVisible = [...imageVisible];
            newImageVisible[index] = false;
            return newImageVisible;
        });
    }

    function toggleFetchReplies() {
        setFetchReplies(!fetchReplies);
        toggleFetchAgain();
    }

    function deletePost(postID) {
        fetch("http://localhost:8080/deletePost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postIDs: [postID], usernames: [postUser] })
        })

        .then(response => {
            if (!response.ok) console.log("Unexpected server error during post deletion.");
            else {
                if (managerPostID !== postID) {
                    toggleFetchReplies();
                    toggleFetchAgain();
                    window.location.reload();
                }
                else {
                    hideReplyBox();
                    backToChannel();
                }
            }
        });
    }

    return (
        <div className="ViewReplies">
            <div className="LikeReplyButtonBox">
                <div className="LikeReplyButtonBoxLeft">
                    {replyList.length > 0 && <button className="CollapseViewReplies" onClick={() => setShowReplies(!showReplies)}>{showReplies ? <>Collapse Replies</> : <>Show Replies</> }</button>}
                    <button className="ReplyButton" onClick={() => showReplyBox(postID)}>Reply</button>
                    {loginState === "admin" && <button className="DeleteButton" onClick={() => {deletePost(postID);}}>Delete Post</button>}
                    <LikeButton postID={postID}/>
                </div>
                <div className="DeadSpace"></div>
                <div className="ImageFlexBox">
                    {image.images && image.images.map((img, index) => (
                        <>
                            <button key={index} className='ImgButton' onClick={() => toggleImageVisible(index)}>View {img.name}</button>
                            {imageVisible[index] && <ImageRender base64Image={img.image} imgType={img.type} hideImage={hideImage} index={index}/>}
                        </>))}
                </div>
            </div>

            {openReplyBox === postID && <ReplyBox postID={postID} hideReplyBox={hideReplyBox} fetchReplies={toggleFetchReplies}/>}

            <div className="ReplyList">
                {replyList.map((reply) => {
                    return (
                        <div className="DummyBox" key={reply.id}>
                            {showReplies && 
                                <div className="ReplyBox">
                                    <div className="ReplyHeading"><UserView user={reply.username} refresh={toggleFetchReplies}/> at {convertToLocal(reply.time)}</div>
                                    <div className="ReplyData"><p>{reply.postData}</p></div>
                                    <div className="ReplyReplies">
                                        <ViewReplies postID={reply.id} postUser={reply.username} showReplyBox={showReplyBox} hideReplyBox={hideReplyBox} openReplyBox={openReplyBox} toggleFetchAgain={toggleFetchAgain}/>
                                    </div>
                                </div>
                            }
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ViewReplies;