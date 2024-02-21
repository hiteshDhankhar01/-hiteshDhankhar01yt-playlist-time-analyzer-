import React, { useState } from 'react';
import axios from 'axios';
let Key = "AIzaSyBusIgNe0gP5NcqnZxfwf0ClVNDLg16MLM"


const Hom = () => {
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [playlistId, setPlaylistId] = useState("");
    const [pageToken, setPageToken] = useState("");
    const [playlistItems, setPlaylistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalDuration, setTotalDuration] = useState(0);

    const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${Key}&playlistId=${playlistId}&pageToken=${pageToken}`;

    const extractListIdFromUrl = (url) => {
        const regex = /[?&]list=([^&]+)/;
        const match = url.match(regex);

        if (match && match[1]) {
            setPlaylistId(match[1]);
        } else {
            alert("Playlist ID not found in the URL");
        }
    };

    const fetchPlaylist = () => {
        axios.get(URL1)
            .then((response) => {
                setPageToken(""); // Clear pageToken
                console.log(response.data.items);
                setPlaylistItems((prevItems) => [...prevItems, ...response.data.items]);

                if (response.data.nextPageToken) {
                    setPageToken(response.data.nextPageToken);
                    fetchPlaylist();
                } else {
                    console.log("No next page"), setLoading(false);

                    // Fetch video length for each item
                    if (Array.isArray(response.data.items)) {
                        response.data.items.forEach((item) => {
                            fetchVideosLength(item.contentDetails.videoId);
                        });
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching playlist:', error);
                setLoading(false);
            });
    };

    const fetchNextPage = () => {
        fetchPlaylist();
    };

    const fetchVideosLength = (videoId) => {
        axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${Key}&fields=items/contentDetails/duration`)
            .then((response) => {
                const duration = response.data.items[0].contentDetails.duration;
                console.log(duration);
                console.log(durationToSeconds(duration));
                const videoLength = durationToSeconds(duration);
                setTotalDuration((prevTotalDuration) => prevTotalDuration + videoLength);
            })
            .catch((error) => {
                console.error('Error fetching video length:', error);
            });
    };

    const durationToSeconds = (durationString) => {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = durationString.match(regex);

        const hours = parseInt(matches[1]) || 0;
        const minutes = parseInt(matches[2]) || 0;
        const seconds = parseInt(matches[3]) || 0;

        const totalSeconds = hours * 60 * 60 + minutes * 60 + seconds;

        return totalSeconds;
    };

    const playlistDetail = () => {
        if (!playlistUrl.trim()) {
            return alert("Input is empty");
        }

        // Clear previous items when a new search is initiated.
        setPlaylistItems([]);
        extractListIdFromUrl(playlistUrl);
        fetchPlaylist();
    };

    const secondsToTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) {
            return "Invalid input";
        }

        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;

        const timeString = `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
        console.info(timeString);
        return timeString;
    };

    return (
        <>
            <div>
                <input type="text" placeholder='Enter YouTube playlist URL' onChange={(e) => setPlaylistUrl(e.target.value)} />
                <button onClick={playlistDetail}>Find</button>
            </div>
            <div>
                <button onClick={() => secondsToTime(totalDuration)}>Duration</button>
            </div>
            {!loading &&
                <div>
                    <h2>Playlist Items:</h2>
                    <ul>
                        {playlistItems.map((item, index) => (
                            <li key={index}>{item.contentDetails.videoId}</li>
                        ))}
                    </ul>
                </div>
            }
        </>
    );
};

export default Hom;