import React, { useState, useEffect } from "react";
import { Manager } from '../../Manager';
import './LikeButton.css';

function LikeButton({ postID }) {
    const [likeCount, setLikeCount] = useState(0);
    const [getLikesAgain, setGetLikesAgain] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const { loginState } = React.useContext(Manager);


    async function getPostLikes(postID) {
        return fetch("http://localhost:8080/getLikes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postID: postID })
        })

        .then(response => {
            if (!response.ok) {
                console.log("Unexpected server error during post like retrieval.");
                return [];
            }

            else return response.json();
        })

        .then(data => {return data});
    }

    useEffect(() => {
        async function getLikes() {
            const data = await getPostLikes(postID);
            setLikeCount(data.likes);
            setIsLiked(data.userLikes.includes(loginState));
            setIsDisliked(data.userDislikes.includes(loginState));
        }

        getLikes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postID, getLikesAgain]);

    async function tryLike() {
        fetch("http://localhost:8080/likePost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postID: postID, username: loginState })
        })

        .then(response => {
            if (!response.ok) {
                console.log("Unexpected server error during post like.");
                return;
            }

            else setGetLikesAgain(!getLikesAgain);
        });
    }

    async function tryDislike() {
        fetch("http://localhost:8080/dislikePost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postID: postID, username: loginState })
        })

        .then(response => {
            if (!response.ok) {
                console.log("Unexpected server error during post dislike.");
                return;
            }

            else setGetLikesAgain(!getLikesAgain);
        });
    }

    return (
        <div className={`LikeButton${isLiked ? "Green" : isDisliked ? "Red" : ""}`}>
            <button className={`LikeButtonInner${isLiked ? "Green" : ""}`} onClick={tryLike}>Like</button>
            <h3 className={`LikeCount${likeCount > 0 ? "Green" : likeCount < 0 ? "Red" : ""}`}>{likeCount}</h3>
            <button className={`DislikeButtonInner${isDisliked ? "Red" : ""}`} onClick={tryDislike}>Dislike</button>
        </div>
    )
}

export default LikeButton;