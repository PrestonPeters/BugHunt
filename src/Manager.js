import React, { createContext, useState, useEffect } from 'react';

export const Manager = createContext();

export const ManagerProvider = ({children}) => {
    const [fetchChannelsAgain, setFetchChannelsAgain] = useState(true);
    const [fetchPostsAgain, setFetchPostsAgain] = useState(true);

    const [loginState, setLoginState] = useState(() => {
        const sessionData = sessionStorage.getItem('loginState');
        if (sessionData === undefined) {
            sessionStorage.setItem('loginState', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [pageState, setPageState] = useState(() => {
        const sessionData = sessionStorage.getItem('pageState');
        if (sessionData === undefined) {
            sessionStorage.setItem('pageState', JSON.stringify("landing"));
            return "landing";
        }
        return sessionData ? JSON.parse(sessionData) : "landing";
    });

    const [channelName, setChannelName] = useState(() => {
        const sessionData = sessionStorage.getItem('channelName');
        if (sessionData === undefined) {
            sessionStorage.setItem('channelName', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [channelDesc, setChannelDesc] = useState(() => {
        const sessionData = sessionStorage.getItem('channelDesc');
        if (sessionData === undefined) {
            sessionStorage.setItem('channelDesc', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [managerPostID, setManagerPostID] = useState(() => {
        const sessionData = sessionStorage.getItem('managerPostID');
        if (sessionData === undefined) {
            sessionStorage.setItem('managerPostID', JSON.stringify(""));
            return -1;
        }
        return sessionData ? JSON.parse(sessionData) : -1;
    });

    const [managerPostTopic, setManagerPostTopic] = useState(() => {
        const sessionData = sessionStorage.getItem('managerPostTopic');
        if (sessionData === undefined) {
            sessionStorage.setItem('managerPostTopic', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [managerPostData, setManagerPostData] = useState(() => {
        const sessionData = sessionStorage.getItem('managerPostData');
        if (sessionData === undefined) {
            sessionStorage.setItem('managerPostData', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [managerPostTime, setManagerPostTime] = useState(() => {
        const sessionData = sessionStorage.getItem('managerPostTime');
        if (sessionData === undefined) {
            sessionStorage.setItem('managerPostTime', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    const [managerPostUser, setManagerPostUser] = useState(() => {
        const sessionData = sessionStorage.getItem('managerPostUser');
        if (sessionData === undefined) {
            sessionStorage.setItem('managerPostUser', JSON.stringify(""));
            return "";
        }
        return sessionData ? JSON.parse(sessionData) : "";
    });

    useEffect(() => {sessionStorage.setItem('loginState', JSON.stringify(loginState))}, [loginState]);

    useEffect(() => {sessionStorage.setItem('pageState', JSON.stringify(pageState))}, [pageState]);

    useEffect(() => {sessionStorage.setItem('channelName', JSON.stringify(channelName))}, [channelName]);

    useEffect(() => {sessionStorage.setItem('channelDesc', JSON.stringify(channelDesc))}, [channelDesc]);

    useEffect(() => {sessionStorage.setItem('managerPostTopic', JSON.stringify(managerPostTopic))}, [managerPostTopic]);

    useEffect(() => {sessionStorage.setItem('managerPostData', JSON.stringify(managerPostData))}, [managerPostData]);

    useEffect(() => {sessionStorage.setItem('managerPostTime', JSON.stringify(managerPostTime))}, [managerPostTime]);

    useEffect(() => {sessionStorage.setItem('managerPostUser', JSON.stringify(managerPostUser))}, [managerPostUser]);

    useEffect(() => {sessionStorage.setItem('managerPostID', JSON.stringify(managerPostID))}, [managerPostID]);

    function login(username) {setLoginState(username);}

    function logout() {setLoginState("");}

    function changePageState(state) {setPageState(state);}

    function changeChannelName(chID) {setChannelName(chID);}

    function changeChannelDesc(chDesc) {setChannelDesc(chDesc);}

    function changePostID(postID) {setManagerPostID(postID);}

    function changePostTopic(postTopic) {setManagerPostTopic(postTopic);}

    function changePostData(postData) {setManagerPostData(postData);}

    function changePostTime(postTime) {setManagerPostTime(postTime);}

    function changePostUser(postUser) {setManagerPostUser(postUser);}

    function toggleFetchChannelsAgain() {setFetchChannelsAgain(!fetchChannelsAgain);}

    function toggleFetchPostsAgain() {setFetchPostsAgain(!fetchPostsAgain);}

    return (
        <Manager.Provider value={{loginState, pageState, channelName, channelDesc, fetchChannelsAgain, 
        fetchPostsAgain, managerPostID, managerPostData, managerPostTopic, managerPostTime, managerPostUser, login, 
        logout, changePageState, changeChannelName, changeChannelDesc, changePostID, changePostTopic, changePostData, 
        toggleFetchChannelsAgain, toggleFetchPostsAgain, changePostTime, changePostUser}}>
            {children}
        </Manager.Provider>
    );
};