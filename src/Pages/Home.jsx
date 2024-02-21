import React, { useEffect, useState } from 'react'
import axios from 'axios';
let Key = "AIzaSyBusIgNe0gP5NcqnZxfwf0ClVNDLg16MLM"
import { IoIosClose } from "react-icons/io";
import './style.css'
// const URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${Key}playlistId=${}`
// let playlistId
// let pageToken


// const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${Key}&playlistId=${playlistId}&pageToken=${pageToken}`


// const URL2 = `https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=${}&key=${key}&fields=items/contentDetails/duration`;

const Home = () => {
    const [playlistUrl, setPlaylistUrl] = useState(null)
    const [playlistId, setPlaylistId] = useState("")
    const [pageToken, setPageToken] = useState("")
    const [playlistItems, setPlaylistItems] = useState([]);
    const [loading, setLoading] = useState(true)
    const [totalDuration, setTotalDuration] = useState(0)


    const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${Key}&playlistId=${playlistId}&pageToken=${pageToken}`

    function extractListIdFromUrl(url) {
        const regex = /[?&]list=([^&]+)/;
        const match = url.match(regex);
        // console.log(match[1])

        if (match && match[1]) {
            setPlaylistId(match[1])
        } else {
            return alert("list is empty")
        }
    }


    const fetchPlaylist = () => {
        console.warn("run")
        axios.get(URL1).then((response) => {
            console.info(response.data.items.length);
            setPlaylistItems((prevItems) => [...prevItems, ...response.data.items]);
            if (Array.isArray(response.data.items)) {
                console.log(response.data.items.length);
                response.data.items.forEach((item, index) => {
                    // console.log(index + item.contentDetails.videoId);
                    fetchVideosLength(item.contentDetails.videoId);
                });
            }
            if (response.data.nextPageToken !== undefined) {
                console.log("next page available");
                let nextPageToken = response.data.nextPageToken
                setPageToken(nextPageToken);
            } else {
                console.info("no next page"),
                    setPageToken("")
                setLoading(false);
                // if (Array.isArray(response.data.items)) {
                //     console.log(response.data.items.length);
                //     response.data.items.forEach((item, index) => {
                //         // console.log(index + item.contentDetails.videoId);
                //         fetchVideosLength(item.contentDetails.videoId);
                //     });
                // }
            }

            // Move the setPageToken("") here
            // setPageToken("");
        }).catch((error) => {
            console.error("Error fetching playlist:", error);
            // Handle the error, e.g., set an error state
        });
    };


    useEffect(() => {
        if (pageToken !== '') {
            // console.log(typeof nextPageToken);
            // console.log(nextPageToken);
            // alert(pageToken);
            fetchPlaylist()
            console.info(URL1)
        }
    }, [pageToken]);

    // const fetchNextPage = () => {
    //     console.log(pageToken)
    //     // fetchPlaylist()
    // }

    const fetchVideosLength = (videoId) => {
        axios.get(`https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=${videoId}&key=${Key}&fields=items/contentDetails/duration`).then((response) => {
            const duration = response.data.items[0].contentDetails.duration;
            // console.log(duration);
            // console.log(durationToSeconds(duration))
            const videoLength = durationToSeconds(duration)
            // setTotalDuration(...videoLength , totalDuration)
            setTotalDuration((prevTotalDuration) => prevTotalDuration + videoLength);


            // console.log(response.data.items);

            // setPlaylistItems(response.data.items)
        })
    }


    function durationToSeconds(durationString) {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = durationString.match(regex);

        const hours = parseInt(matches[1]) || 0;
        const minutes = parseInt(matches[2]) || 0;
        const seconds = parseInt(matches[3]) || 0;

        const totalSeconds = hours * 60 * 60 + minutes * 60 + seconds;

        return totalSeconds;
    }

    const playlistDetail = () => {
        setPlaylistUrl(null)
        setPlaylistId("")
        setPageToken("")
        setPlaylistItems([])
        setLoading(true)
        setTotalDuration(0)
        if (playlistUrl === null || playlistUrl === "") {
            return alert("input is empty")
        } else {
            setPlaylistItems([]);
            extractListIdFromUrl(playlistUrl)
            fetchPlaylist();
        }
    }



    function secondsToTime(seconds) {
        console.info(seconds)
        if (isNaN(seconds) || seconds < 0) {
            return "Invalid input";
        }

        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const remainingSeconds = seconds % 60;

        const timeString = `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
        return timeString, console.info(timeString), console.log(playlistItems.length)
    }

    const clearInput = () => {
        console.log("clear")
    }
    return (
        <div>
            <header className='head '>
                <nav className='container'>
                    <h1>YouTube Playlist Time Analyzer</h1>
                </nav>


            </header>

            <div className='main_container container'>
                <div className='search_container'>
                    <input type="text" placeholder='find playlist length' onChange={(e) => setPlaylistUrl(e.target.value)} />
                    <button className='clear_button' onClick={clearInput}><IoIosClose /></button>
                    <button className='search_button' onClick={playlistDetail}>Find</button>
                </div>
                {/* <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis earum quod nesciunt ipsam quas, iure quasi est debitis ad alias architecto ea quos nisi dignissimos dolor tempora labore necessitatibus sed. Sequi, pariatur! Accusantium.
                </div>
                <div>
                    <table>
                        <tr>
                            <th>dfsdf</th>
                            <th>dfsdf</th>
                        </tr>
                        <tr>
                            <td>sfsdfs</td>
                            <td>sfsdfs</td>
                        </tr>
                        <tr>
                            <td>sfsdfs</td>
                            <td>sfsdfs</td>
                        </tr>
                        <tr>
                            <td>sfsdfs</td>
                            <td>sfsdfs</td>
                        </tr>
                        <tr>
                            <td>sfsdfs</td>
                            <td>sfsdfs</td>
                        </tr>
                        
                    </table>
                </div> */}
                <div>
                    <div><span>Total Number of Videoes:</span> 79  </div>
                    <div><span>Total length of playlist:</span> 1 day, 2 hours, 2 minutes, 55 seconds </div>
                    <h4>Total length of playlist different speed:</h4>
                    <div>at 1.25: 20 hours, 50 minutes, 20 seconds </div>
                    <div>at 1.50: 20 hours, 50 minutes, 20 seconds </div>
                    <div>at 1.75: 20 hours, 50 minutes, 20 seconds </div>
                    <div>at 2.00: 20 hours, 50 minutes, 20 seconds </div>

                </div>

            </div>

            <div>
                <button onClick={(() => secondsToTime(totalDuration))}>durection</button>
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
        </div>
    )
}

export default Home
