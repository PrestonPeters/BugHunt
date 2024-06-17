import React, { useState, useContext, useEffect } from "react";
import { Manager } from "../../Manager";
import LoginWarning from "../LoginWarning/LoginWarning";
import './ViewPosts.css';

function ViewPosts({ postChannelList, postSubChannelList, landingPage }) {
    const { loginState, changePageState, changePostID, changePostTopic, changePostData, changePostTime, changePostUser, changeChannelName } = useContext(Manager);
    const [postList, setPostList] = useState([]);
    const [postSearchTerm, setPostSearchTerm] = useState("");
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [viewAllPosts, setViewAllPosts] = useState(loginState !== "" ? false : true);
    const [loginWarning, setLoginWarning] = useState(false);
    const [workingChannelList, setWorkingChannelList] = useState(viewAllPosts ? postChannelList : postSubChannelList);
    const [sortMethod, setSortMethod] = useState("newest");

    function convertToLocal(time) {
        const dateObject = new Date(time + "Z");
        const localYear = dateObject.getFullYear();
        const localMonth = dateObject.getMonth() + 1;
        const localDay = dateObject.getDate();
        const localHour = (dateObject.getHours() > 9 ? dateObject.getHours() : "0" + dateObject.getHours());
        const localMinute = (dateObject.getMinutes() > 9 ? dateObject.getMinutes() : "0" + dateObject.getMinutes());

        return `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}`;
    }

    async function sortPosts() {
        let sortedPosts = [...postList];
        let users = await getUsers();

        if (sortMethod === "newest") sortedPosts.sort((a, b) => b.id - a.id);
        else if (sortMethod === "oldest") sortedPosts.sort((a, b) => a.id - b.id);
        else if (sortMethod === "mostPopular") sortedPosts.sort((a, b) => b.likes - a.likes);
        else if (sortMethod === "leastPopular") sortedPosts.sort((a, b) => a.likes - b.likes);

        else {
            const response = await fetch ("http://localhost:8080/getUserPosts", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({users: users})
                });

                if (!response.ok) {
                    console.log("Unexpected server error during post count retrieval.");
                    return;
                }
                else {
                    const userPostCounts = await response.json();
                    sortedPosts.sort((a, b) => {
                        if (sortMethod === "userWithMostPosts") return userPostCounts[b.username] - userPostCounts[a.username];
                        else if (sortMethod === "userWithLeastPosts") return userPostCounts[a.username] - userPostCounts[b.username];
                        else return 0;
                    });
                }
        }

        sortedPosts = sortedPosts.filter((post) => {
            return (
                post.topic.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.postData.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.channelName.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.username.toLowerCase().includes(postSearchTerm.toLowerCase())
            )
        });
        setFilteredPosts(sortedPosts);
    }

    async function getUsers() {return Promise.resolve(filteredPosts.map((post) => {return post.username}))}

    function getPosts() {
        setPostList([]);
        setFilteredPosts([]);

        fetch("http://localhost:8080/getPosts", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({channelNames: workingChannelList})
        })

        .then(response => {
            if (!response.ok) console.log("Unexpected server error during post retrieval.");
            else return response.json();
        })

        .then(data => {
            let formattedResult = data.posts;
            setPostList(formattedResult);
        })
    }

    useEffect(() => {
        sortPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortMethod, postList, postSearchTerm]);

    useEffect(() => {
        setWorkingChannelList(viewAllPosts ? postChannelList : postSubChannelList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postChannelList, postSubChannelList, viewAllPosts, loginState, landingPage]);

    useEffect(() => {
        if (landingPage && loginState !== "") setViewAllPosts(false);
        else setViewAllPosts(true);
    }, [landingPage, loginState]);

    useEffect(() => {
        getPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workingChannelList]);

    return (
        <div className="ChRecentPosts">
            {loginWarning && <LoginWarning/>}
            <div className="ChannelTopOfRecent">
                <h1 className="RecentPostHeading">Recent Posts...</h1>
                <div className="SearchAndSort">
                    <input className="ChannelPostSearch" type="text" placeholder="Search posts..." spellCheck="false" autoComplete="off"
                    onChange={(e) => setPostSearchTerm(e.target.value)}></input>
                    <select className="ChannelPostSort" onChange={(e) => setSortMethod(e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="mostPopular">Most Popular</option>
                        <option value="leastPopular">Least Popular</option>
                        <option value="userWithMostPosts">User With Most Posts</option>
                        <option value="userWithLeastPosts">User With Least Posts</option>
                    </select>
                </div>

            </div><br></br>

            <div className="ViewPostsBox">
                {postList.length > 0 && <>{filteredPosts.map((post) => {
                    return (
                        <div className="ViewPostsPost" key={post.id}>
                            <div className="ViewPostsPostHeading" 
                            onClick={() => {
                                if (loginState !== "") {
                                    changePostID(post.id);
                                    changePostTopic(post.topic);
                                    changePostData(post.postData);
                                    changePostTime(convertToLocal(post.time));
                                    changePostUser(post.username);
                                    changeChannelName(post.channelName);
                                    changePageState("viewPost");
                                }

                                else {
                                    setLoginWarning(true);
                                    setTimeout(() => setLoginWarning(false), 3000);
                                }
                            }}><p>{post.topic} - Posted at {convertToLocal(post.time)} in {post.channelName} by {post.username}</p></div>
                            <p className="ViewPostsPostDataPortion">{post.postData}</p>
                        </div>
                    )
                })}</>}
                {postList.length === 0 && <p className="NoPostsFoundWarning">No posts found!</p>}
                {landingPage && loginState !== "" && !viewAllPosts && <button className="TogglePostView" onClick={() => {
                    setWorkingChannelList(postChannelList);
                    setViewAllPosts(true);
                }}>View All Posts</button>}
                {landingPage && loginState !== "" && viewAllPosts && <button className="TogglePostView" onClick={() => {
                    setWorkingChannelList(postSubChannelList);
                    setViewAllPosts(false);
                    }}>View Posts From Your Channels</button>}
            </div>
        </div>
    )
}

export default ViewPosts;