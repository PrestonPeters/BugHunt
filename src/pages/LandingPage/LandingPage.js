import './LandingPage.css';
import React, { useState, useEffect, useContext, useRef } from 'react';
import CreateChannel from '../CreateChannel/CreateChannel';
import ViewChannel from '../ViewChannel/ViewChannel';
import ViewPost from '../ViewPost/ViewPost';
import ViewPosts from '../ViewPost/ViewPosts';
import CreatePost from '../CreatePost/CreatePost';
import Account from '../Account/Account';
import LoginWarning from '../LoginWarning/LoginWarning';
import { Manager } from '../../Manager';

function LandingPage() {
    const [expanded, setExpanded] = useState([]);
    const [channelSearch, setChannelSearch] = useState("");
    const [filteredChannelList, setFilteredChannelList] = useState([]);
    const [filteredSubChannelList, setFilteredSubChannelList] = useState([]);
    const [channelStrings, setChannelStrings] = useState([]);
    const [subChannelStrings, setSubChannelStrings] = useState([]);
    const [viewAll, setViewAll] = useState(true);
    const [loginWarning, setLoginWarning] = useState(false);
    const [scrollHeight, setScrollHeight] = useState(0);
    const scrollPosition = useRef();
    const { loginState, pageState, changePageState, changeChannelName, changeChannelDesc, fetchChannelsAgain } = useContext(Manager);

    function welcome() {
        return (
            <div className="RightPane">
                <div className="WelcomePane">
                    <div className="LandingInnerBox">
                        <h1 className="Welcome">Welcome to BugHunt!</h1>
                        <h2>BugHunt is a forum for users to ask and answer programming questions of all sorts. Browse the existing
                            channels to see if your question has already been answered, or post a new question within the right channel!
                            If you don't see a channel that fits your question, create a new one and work your way up from
                            Gatherer to Legendary Hunter!</h2>
                        <h1 className="Hunt">Happy Hunting!</h1>
                    </div>
                </div>    

                <div className="RecentPostLandingBox">
                    <ViewPosts postChannelList={channelStrings} postSubChannelList={subChannelStrings} landingPage={true}/>
                </div>
            </div>
        )
    }

    function expandChannel(e, id) {
        e.preventDefault();

        setScrollHeight(scrollPosition.current.scrollTop);

        if (expanded.includes(id)) setExpanded([]);
        else setExpanded([id]);
    }

    function DisplayChannelList() {
        if ((viewAll && (filteredChannelList === null || filteredChannelList.length === 0)) || 
        (!viewAll && (filteredSubChannelList === null || filteredSubChannelList.length === 0))) {
            return (
                <div className="ChannelList">
                    <div className="NoChannel"><p>No channels found!</p></div>
                    {loginState !== "" && <button className="ToggleView" onClick={() => setViewAll(!viewAll)}>{viewAll ? "View Your Channels" : "View All Channels"}</button>}
                </div>
            )
        }

        if (viewAll && (filteredChannelList !== null && filteredChannelList.length > 0)) {
            return (
                <div className="ChannelList" ref={scrollPosition} data-scroll={0}>
                    {(loginState === "" || viewAll) && filteredChannelList.map((channel, index) => (
                        <div key={index} className="ChannelContainer">
                            <div className="ChannelOuter"><div className="ChannelItem" onClick={(e) => expandChannel(e, index)}>
                                {!expanded.includes(index) && <span className="arrow"></span>}
                                {expanded.includes(index) && <span className="arrow expanded"></span>}
                                {channel.name}
                            </div>
                            <button className="ChannelButton" 
                            onClick={() => {
                                if (loginState !== "") {
                                    changeChannelName(channel.name);
                                    changeChannelDesc(channel.desc);
                                    changePageState("viewCh");
                                }

                                else {
                                    setLoginWarning(true);
                                    setTimeout(() => setLoginWarning(false), 5000);
                                }
                            }
                            }>Visit Channel</button></div>
                            {expanded.includes(index) && <div className="ChannelInnerDescription">{channel.desc}</div>}
                        </div>
                    ))}
                    {loginState !== "" && <button className="ToggleView" onClick={() => setViewAll(!viewAll)}>{viewAll ? "View Your Channels" : "View All Channels"}</button>}
                </div>
            )};

        return (
            <div className="ChannelList" ref={scrollPosition} data-scroll={0}>
                {loginState !== "" && !viewAll && filteredSubChannelList.map((channel, index) => (
                    <div key={index} className="ChannelContainer">
                        <div className="ChannelOuter"><div className="ChannelItem" onClick={(e) => expandChannel(e, index)}>
                            {!expanded.includes(index) && <span className="arrow"></span>}
                            {expanded.includes(index) && <span className="arrow expanded"></span>}
                            {channel.name}
                        </div>
                        <button className="ChannelButton"
                        onClick={() => {
                            if (loginState !== "") {
                                    changeChannelName(channel.name);
                                    changeChannelDesc(channel.desc);
                                    changePageState("viewCh");
                                }
                                
                                else {
                                    setLoginWarning(true);
                                    setTimeout(() => setLoginWarning(false), 5000);
                                }
                        }
                        }>Visit Channel</button></div>
                        {expanded.includes(index) && <div className="ChannelInnerDescription">{channel.desc}</div>}
                    </div>
                ))}

                {loginState !== "" && <button className="ToggleView" onClick={() => setViewAll(!viewAll)}>{viewAll ? "View Your Channels" : "View All Channels"}</button>}
            </div>
        )
    }

    useEffect(() => {
        setChannelStrings([]);
        setSubChannelStrings([]);
        setFilteredChannelList([]);
        setFilteredSubChannelList([]);
        fetch("http://localhost:8080/getChannels", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        .then(res => {
            if (!res.ok) console.log("Unexpected server error.");
            return res.json();
        })

        .then(data => {
            const sortedData = data.channels.sort((a, b) => a.name.localeCompare(b.name));
            setChannelStrings(sortedData.map((channel) => channel.name));
            const filteredData = sortedData.filter((channel) => channel.name.toLowerCase().includes(channelSearch.toLowerCase()));
            setFilteredChannelList(filteredData);
        });

        if (loginState !== "") {
            fetch("http://localhost:8080/getSubscribed", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userID: loginState })
            })

            .then(res => {
                if (!res.ok) console.log("Unexpected server error.");
                return res.json();
            })

            .then(data => {
                if (data && data.channels && data.channels.length > 0) {
                    const sortedData = data.channels.sort((a, b) => a.name.localeCompare(b.name));
                    setSubChannelStrings(sortedData.map((channel) => channel.name));
                    const filteredData = sortedData.filter((channel) => channel.name.toLowerCase().includes(channelSearch.toLowerCase()));
                    setFilteredSubChannelList(filteredData);
                }
            });
        }

        else {
            setSubChannelStrings(channelStrings);
            setFilteredSubChannelList(filteredChannelList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelSearch, fetchChannelsAgain, loginState]);

    useEffect(() => {
        if (loginWarning) document.addEventListener("mousedown", () => setLoginWarning(false));
        else document.removeEventListener("mousedown", () => setLoginWarning(false));
    }, [loginWarning]);

    useEffect(() => {
        if (loginState === "") setViewAll(true);
        else setViewAll(false);
    }, [loginState]);

    useEffect(() => {if (scrollPosition.current) scrollPosition.current.scrollTop = scrollHeight}, [scrollHeight, expanded]);

    return (
        <div className="MasterLayout">
            {loginWarning && <LoginWarning/>}
            <div className="LeftLayout">
                <div className="ChannelPane">
                    <div className="ChannelInner">
                        <div className="CreateChannelButton">
                            <button onClick={() => {
                                if (loginState === "") {
                                    setLoginWarning(true);
                                    setTimeout(() => setLoginWarning(false), 5000);
                                }
                                else changePageState("createCh");}}>Create Channel</button>
                        </div>

                        <input className="ChannelSearch" type="text" placeholder="Search channels..." value={channelSearch} spellCheck="false" autoComplete="off"
                        onChange={(e) => setChannelSearch(e.target.value)}></input>

                        <DisplayChannelList/>
                    </div>
                </div>
            </div>

            {pageState === "landing" && welcome()}
            {pageState === "createCh" && <CreateChannel/>}
            {pageState === "viewCh" && <ViewChannel/>}
            {pageState === "createPo" && <CreatePost/>}
            {pageState === "acc" && <Account/>}
            {pageState === "viewPost" && <ViewPost/>}
        </div>
    )
}

export default LandingPage;