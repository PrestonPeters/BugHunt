import './CreateChannel.css';
import { useState, useEffect, useContext } from 'react';
import { Manager } from '../../Manager';

function CreateChannel() {
    const [channelName, setChannelName] = useState("");
    const [channelDescription, setChannelDescription] = useState("");
    const [channelFlag, setChannelFlag] = useState(false);
    const [emptyFlag, setEmptyFlag] = useState(false);
    const [descEmptyFlag, setDescEmptyFlag] = useState(false);
    const { changePageState, changeChannelName, changeChannelDesc, toggleFetchChannelsAgain } = useContext(Manager);

    useEffect(() => {
        if (channelName === "") {
            setChannelFlag(false);
            return;
        }
        fetch("http://localhost:8080/checkNameAvailable", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: channelName })
        })

        .then(res => {
            if (res.status === 204) {
                setChannelFlag(true);
                return;
            }
            setChannelFlag(false);
        });
    }, [channelName]);

    function createChannel(e) {
        e.preventDefault();
        if (!channelFlag) {
            if (channelName === "") {
                setEmptyFlag(true);
                if (channelDescription === "") {
                    setDescEmptyFlag(true);
                }
                return;
            }

            fetch("http://localhost:8080/addChannel", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: channelName, desc: channelDescription })
            })

            .then(res => {
                if (res.status === 201) {
                    console.log("Channel created!");
                    toggleFetchChannelsAgain();
                    changeChannelName(channelName);
                    changeChannelDesc(channelDescription);
                    changePageState("viewCh");
                }
                else {
                    console.log("Database error during channel creation");
                }
            });
        }
    }

    function checkNameEmpty() { if (channelName === "") setEmptyFlag(true); }

    function checkDescEmpty() { if (channelDescription === "") setDescEmptyFlag(true); }

    return (
        <div className="RightPane">
            <form className="CreateChannelForm" id="CreateChannelForm">
                <div className="CreateChannelHead"><h1>Create Channel</h1></div>
                <label htmlFor="ChannelTitle" className="ChannelTitleLabel">Channel Name (32 character maximum)</label>
                <input className="ChannelTitle" id="ChannelTitle" type="text" placeholder="Channel Title" value={channelName} spellCheck="false" autoComplete="off" maxLength={32} required
                onChange={(e) => setChannelName(e.target.value)}
                onBlur={checkNameEmpty}></input>
                {channelFlag && <div className="ChannelFlag">Channel name already exists.</div>}
                {emptyFlag && <div className="ChannelFlag">Channel name cannot be empty.</div>}
                <br></br>
                <label htmlFor="ChannelDesc" className="ChannelDescriptionLabel">Channel Description (300 character maximum)</label>
                <textarea className="ChannelDesc" id="ChannelTitle" type="text" placeholder="Channel Description" value={channelDescription} spellCheck="false" maxLength={300} required
                onChange={(e) => setChannelDescription(e.target.value)}
                onBlur={checkDescEmpty}></textarea>
                {descEmptyFlag && <div className="ChannelFlag">Channel description cannot be empty.</div>}
                <br></br>
                <button className="SubmitCreateChannel" onClick={(e) => createChannel(e)}>Create Channel</button>
            </form>
        </div>
    )
}

export default CreateChannel;