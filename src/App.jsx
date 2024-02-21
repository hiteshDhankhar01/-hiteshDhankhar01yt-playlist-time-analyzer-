import { useEffect, useState } from 'react';
import axios from 'axios';
import { IoIosClose } from "react-icons/io";
import './App.css';
import logo from './assets/logo5.gif'
import Alert from './components/Alert';


const App = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [pageToken, setPageToken] = useState("");
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showDataPage, setShowDataPage] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);



  const Key = "AIzaSyBusIgNe0gP5NcqnZxfwf0ClVNDLg16MLM";

  const URL1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key=${Key}&playlistId=${playlistId}&pageToken=${pageToken}`;


  // Step 1
  const playlistDetail = () => {

    // setPageLoad(false)
    if (playlistUrl === null || playlistUrl === "") {
      setAlertMessage("Input is empty");
      setShowAlert(true);
    } else {
      setTotalDuration(0)
      setPlaylistItems([]);
      extractListIdFromUrl(playlistUrl);
    }
  };

  useEffect(() => {
    if (showAlert === true) {
      setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 3000);
    }
  }, [showAlert]);



  useEffect(() => {
    if (totalDuration === 0 && playlistItems.length === 0 && playlistUrl != null && playlistUrl != "") {
      extractListIdFromUrl(playlistUrl);
    }
  }, [totalDuration, setPlaylistItems])

  // Step 2
  function extractListIdFromUrl(url) {
    // console.log("extractListIdFromUrl")
    const regex = /[?&]list=([^&]+)/;
    const match = url.match(regex);

    if (match && match[1]) {
      setLoading(true);
      setPlaylistId(match[1])
      setPlaylistUrl("");
      // console.log("match" + playlistId)
    } else {
      clearInput()
      setAlertMessage("Invalid url");
      setShowAlert(true);
    }
  }

  // Step 3
  useEffect(() => {
    if (playlistId !== '') {
      fetchPlaylist();
    }
  }, [playlistId]);

  // Step 4
  const fetchPlaylist = () => {
    // console.log("fetchPlaylist")
    axios.get(URL1)
      .then((response) => {
        setPlaylistItems((prevItems) => [...prevItems, ...response.data.items]);

        if (Array.isArray(response.data.items)) {
          response.data.items.forEach((item) => {
            fetchVideosLength(item.contentDetails.videoId);
          });
        }

        if (response.data.nextPageToken !== undefined) {
          setPageToken(response.data.nextPageToken);
        }
        else {
          setPageToken("");
          setPlaylistUrl("")
          setLoading(false)
          setShowDataPage(true)
        }
      })
      .catch((error) => {
        console.error("Error fetching playlist:", error);
      });
  };

  // Step 4(2)
  useEffect(() => {
    if (pageToken !== '') {
      fetchPlaylist();
    }
  }, [pageToken]);

  // Step 5
  const fetchVideosLength = (videoId) => {
    axios.get(`https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id=${videoId}&key=${Key}&fields=items/contentDetails/duration`)
      .then((response) => {
        const duration = response.data.items[0].contentDetails.duration;
        const videoLength = durationToSeconds(duration);
        setTotalDuration((prevTotalDuration) => prevTotalDuration + videoLength);
        setLoading(false);
        // setPageLoad(true);
      });
  };


  function durationToSeconds(durationString) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationString.match(regex);

    const hours = parseInt(matches[1]) || 0;
    const minutes = parseInt(matches[2]) || 0;
    const seconds = parseInt(matches[3]) || 0;

    return hours * 60 * 60 + minutes * 60 + seconds;
  }


  const showData = () => {
    return (
      <>
        <div>
          <span>Total Number of Videos:</span>{playlistItems.length}</div>
        <div><span>Total length of playlist:</span> {secondsToTime(totalDuration)}</div>
        <h4>Total length of playlist different speed:</h4>
        <div>at 1.25:
          {secondsToTime(Math.floor(totalDuration / 1.25))}
        </div>
        <div>at 1.50:
          {secondsToTime(Math.floor(totalDuration / 1.50))} </div>
        <div>at 1.75:
          {secondsToTime(Math.floor(totalDuration / 1.75))} </div>
        <div>at 2.00:
          {secondsToTime(Math.floor(totalDuration / 2))} </div>
      </>
    )
  }

  // last step
  const secondsToTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
      return "Invalid input";
    }

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const timeString =
      `${days > 0 ? `${days} ${days === 1 ? "day" : "days"},` : ""}
    ${hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : ""},
    ${minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : ""},
    ${remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ""}`;

    return timeString;
  };

  const inputHandler = (e) => {
    setPlaylistUrl(e.target.value)
  }

  const clearInput = () => {
    setPlaylistUrl("");
    // console.log("Input cleared");
  };

  return (
    <div>
      <header className='head effect6'>
        <nav className=' container'>
          <h1><img className='logo' src={logo} alt="logo" /> YT Playlist Time Analyzer</h1>
        </nav>
      </header>
      {/* <Alert message={"testing..."}/> */}
      {/* Show custom alert if showAlert is true */}
      {showAlert && <Alert message={alertMessage} />}

      <div className='main_container container'>
        <p  >Paste a YouTube playlist link to find and calculate the total duration effortlessly on my web app.</p>
        <div className='search_container'>
          <input type="text" placeholder='Find playlist length' value={playlistUrl} onChange={inputHandler} />
          <button className='clear_button' onClick={clearInput} >
            &times;
            {/* <IoIosClose /> */}
          </button>
          <button className='search_button' onClick={playlistDetail}>Find</button>
        </div>
        <div>
          {showDataPage &&
            <>
              {showData()}
            </>
          }
          {loading && <span>Loading...</span>}
        </div>
      </div>
    </div>
  );
};

export default App;