import React, { useState, useContext } from 'react';
import { Manager } from '../../Manager';
import UploadImage from '../CreatePost/UploadImage.js';
import './ReplyBox.css';

function ReplyBox({ postID, hideReplyBox, fetchReplies }) {
    const [replyData, setReplyData] = useState("");
    const [image, setImage] = useState([]);
    const { loginState } = useContext(Manager);

    function tryReply(e, parentID, data, img) {
        if (data === "") return;
        e.preventDefault();
        const timeStamp = Date.now();
        const dateObject = new Date(timeStamp);
        const UTCYear = dateObject.getUTCFullYear();
        const UTCMonth = dateObject.getUTCMonth() + 1;
        const UTCDay = dateObject.getUTCDate();
        const UTCHour = (dateObject.getUTCHours() > 9 ? dateObject.getUTCHours() : "0" + dateObject.getUTCHours());
        const UTCMinute = (dateObject.getUTCMinutes() > 9 ? dateObject.getUTCMinutes() : "0" + dateObject.getUTCMinutes());
        const postTime = `${UTCYear}-${UTCMonth}-${UTCDay} ${UTCHour}:${UTCMinute}`;

        const formData = new FormData();
        formData.append('channelName', null);
        formData.append('topic', null);
        formData.append('data', data);
        formData.append('userID', loginState);
        formData.append('timeStamp', postTime);
        formData.append('parentID', parentID);
        if (img) for (let i = 0; i < img.length; i++) formData.append('image', img[i]);
        console.log(formData);

        fetch("http://localhost:8080/addPost", {
            method: 'POST',
            body: formData
        })

        .then(res => {
            if (res.status !== 201) {
                console.log("Database error during reply creation");
            }

            else {
                console.log("Reply created!");
                fetchReplies();
            }
        });
    }

    async function imageSelect(img) {
        setImage(image => [...image, img]);
    }
    async function imageRemove(img) {
        setImage(image => image.filter(image => image !== img));
    }

    return (
        <div className="ReplyBox">
            <textarea className="ReplyTextArea" placeholder="Reply here..."
            onChange={(e) => setReplyData(e.target.value)} value={replyData}></textarea>
            <div className="ReplyButtonBox">
                <button className="ReplySubmitButton" onClick={(e) => {
                    e.preventDefault();
                    let replyDataCopy = replyData;
                    tryReply(e, postID, replyDataCopy, image);
                    hideReplyBox();
                }}>Submit</button>
                <UploadImage onImageChange={imageSelect} onImageRemove={imageRemove} images={image}/>
                <button className="ReplyCancelButton" onClick={(e) => {
                    e.preventDefault();
                    hideReplyBox();
                }}>Cancel</button>
            </div>
        </div>
    )
}

export default ReplyBox;