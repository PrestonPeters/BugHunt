import './CreatePost.css';
import UploadImage from './UploadImage.js';
import { useState, useContext } from 'react';
import { Manager } from '../../Manager';

function CreatePost() {
    const [postTopic, setPostTopic] = useState("");
    const [postData, setPostData] = useState("");
    const [topicEmpty, setTopicEmpty] = useState(false);
    const [dataEmpty, setDataEmpty] = useState(false);
    const [image, setImage] = useState([]);
    const { loginState, channelName, changePostID, changePostTopic, changePostData, changePostTime, changePostUser, toggleFetchPostsAgain, changePageState } = useContext(Manager);

    function convertToLocal(time) {
        const dateObject = new Date(time + "Z");
        const localYear = dateObject.getFullYear();
        const localMonth = dateObject.getMonth() + 1;
        const localDay = dateObject.getDate();
        const localHour = (dateObject.getHours() > 9 ? dateObject.getHours() : "0" + dateObject.getHours());
        const localMinute = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : "0" + dateObject.getMinutes());

        return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}`;
    }

    async function createPost(e) {
        e.preventDefault();
        checkIfEmpty();

        if (topicEmpty || dataEmpty) return;

        const timeStamp = Date.now();
        const dateObject = new Date(timeStamp);
        const UTCYear = dateObject.getUTCFullYear();
        const UTCMonth = dateObject.getUTCMonth() + 1;
        const UTCDay = dateObject.getUTCDate();
        const UTCHour = (dateObject.getUTCHours() > 9 ? dateObject.getUTCHours() : "0" + dateObject.getUTCHours());
        const UTCMinute = (dateObject.getUTCMinutes() > 9 ? dateObject.getUTCMinutes() : "0" + dateObject.getUTCMinutes());

        const postTime = `${UTCYear}-${UTCMonth}-${UTCDay} ${UTCHour}:${UTCMinute}`;

        const formData = new FormData();
        formData.append('channelName', channelName);
        formData.append('topic', postTopic);
        formData.append('data', postData);
        formData.append('userID', loginState);
        formData.append('timeStamp', postTime);
        if (image) for (let i = 0; i < image.length; i++) formData.append('image', image[i]);

        fetch("http://localhost:8080/addPost", {
            method: 'POST',
            body: formData
        })

        .then(res => {
            if (res.status === 201) return res.json();
            else {
                console.log("Database error during post creation");
                return [];
            }
        })

        .then(data => {
            if (data.length === 0) return;
            else {
                changePostID(data.postID);
                changePostTopic(postTopic);
                changePostData(postData);
                changePostTime(convertToLocal(postTime));
                changePostUser(loginState);
                toggleFetchPostsAgain();
                changePageState("viewPost");
            }
        })
    }

    function checkIfTopicEmpty() {
        if (postTopic === "") setTopicEmpty(true);
        else setTopicEmpty(false);
    }

    function checkIfDataEmpty() {
        if (postData === "") setDataEmpty(true);
        else setDataEmpty(false);
    }

    function checkIfEmpty() {
        checkIfTopicEmpty();
        checkIfDataEmpty();
    }

    async function imageSelect(img) {
        setImage(image => [...image, img]);
    }
    
    async function imageRemove(img) {
        setImage(image => image.filter(image => image !== img));
    }

    return (
        <div className="RightPane">
            <form className="CreatePostForm" id="CreatePostForm">
                <div className="CreatePostHead"><h1>Create Post in {channelName}</h1></div>
                <label htmlFor="CreatePostTopic" className="PostTopicLabel">Post Title (50 character maximum)</label>
                <input className="CreatePostTopic" id="CreatePostTopic" type="text" placeholder="Post Topic" value={postTopic} spellCheck="false" autoComplete="off" maxLength={50} required
                onChange={(e) => setPostTopic(e.target.value)}
                onBlur={checkIfTopicEmpty}></input>
                {topicEmpty && <div className="PostFlag">Topic cannot be empty.</div>}
                <br></br>
                <label htmlFor="CreatePostData" className="PostDataLabel">Post Data (2000 character maximum)</label>
                <textarea className="CreatePostData" id="CreatePostData" type="text" placeholder="Post Data" value={postData} spellCheck="false" maxLength={2000} required
                onChange={(e) => setPostData(e.target.value)}
                onBlur={checkIfDataEmpty}></textarea>
                {dataEmpty && <div className="PostFlag">Data cannot be empty.</div>}
                <br></br>
                <div className='CreatePostButtonBox'>
                    <UploadImage onImageChange={imageSelect} onImageRemove={imageRemove} images={image}/>
                    <button className="SubmitCreatePost" onClick={(e) => createPost(e)}>Create Post</button>
                </div>
            </form>
        </div>
    )
}

export default CreatePost;