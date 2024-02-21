import React, { useState } from 'react';
import axios from 'axios';

const APIS = process.env.REACT_APP_APIS.split(',');

const URL1 = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&fields=items/contentDetails/videoId,nextPageToken&key={}&playlistId={}&pageToken=';
const URL2 = 'https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&id={}&key={}&fields=items/contentDetails/duration';

const Main = () => {
    const [displayText, setDisplayText] = useState([]);

    const getPlaylistInfo = async (playlistLink) => {
        const playlistId = getPlaylistId(playlistLink);
        let nextPage = '';
        let cnt = 0;
        let totalDuration = 0;
        const timeSlice = findTimeSlice();

        while (true) {
            try {
                const response1 = await axios.get(`${URL1}${APIS[timeSlice]}&${playlistId}${nextPage}`);
                const videoIds = response1.data.items.map(item => item.contentDetails.videoId);
                cnt += videoIds.length;

                const urlList = videoIds.join(',');
                const response2 = await axios.get(`${URL2}${urlList}&${APIS[timeSlice]}`);

                response2.data.items.forEach(item => {
                    totalDuration += isodate.parseDuration(item.contentDetails.duration).seconds;
                });

                if (!response1.data.nextPageToken || cnt >= 500) {
                    const result = cnt >= 500 ? ['No of videos limited to 500.'] : [
                        `No of videos: ${cnt}`,
                        `Average length of video: ${parse(totalDuration / cnt)}`,
                        `Total length of playlist: ${parse(totalDuration)}`,
                        `At 1.25x: ${parse(totalDuration / 1.25)}`,
                        `At 1.50x: ${parse(totalDuration / 1.5)}`,
                        `At 1.75x: ${parse(totalDuration / 1.75)}`,
                        `At 2.00x: ${parse(totalDuration / 2)}`,
                    ];
                    setDisplayText(result);
                    break;
                }

                nextPage = `&pageToken=${response1.data.nextPageToken}`;
            } catch (error) {
                setDisplayText([error.message]);
                break;
            }
        }
    };

    const getPlaylistId = (playlistLink) => {
        const match = /^([\S]+list=)?([\w_-]+)[\S]*$/.exec(playlistLink);
        return match ? match[2] : 'invalid_playlist_link';
    };

    const parse = (duration) => {
        const ts = duration;
        const td = 0;
        const [th, tr] = [Math.floor(ts / 3600), ts % 3600];
        const [tm, tsNew] = [Math.floor(tr / 60), tr % 60];
        let ds = '';

        if (td) {
            ds += ` ${td} day${td !== 1 ? 's' : ''},`;
        }

        if (th) {
            ds += ` ${th} hour${th !== 1 ? 's' : ''},`;
        }

        if (tm) {
            ds += ` ${tm} minute${tm !== 1 ? 's' : ''},`;
        }

        if (tsNew) {
            ds += ` ${tsNew} second${tsNew !== 1 ? 's' : ''}`;
        }

        if (!ds) {
            ds = '0 seconds';
        }

        return ds.trim().replace(/,$/, '');
    };

    const todayAt = (hr, min = 0, sec = 0, micros = 0) => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hr, min, sec, micros);
    };

    const findTimeSlice = () => {
        const timeNow = new Date();
        let timeSlice = 0;

        if (todayAt(0) <= timeNow && timeNow < todayAt(4)) {
            timeSlice = 1;
        } else if (todayAt(4) <= timeNow && timeNow < todayAt(8)) {
            timeSlice = 2;
        } else if (todayAt(8) <= timeNow && timeNow < todayAt(12)) {
            timeSlice = 3;
        } else if (todayAt(12) <= timeNow && timeNow < todayAt(16)) {
            timeSlice = 4;
        } else if (todayAt(16) <= timeNow && timeNow < todayAt(20)) {
            timeSlice = 5;
        }

        return timeSlice;
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const playlistLink = event.target.search_string.value.trim();
        await getPlaylistInfo(playlistLink);
    };

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <label>
                    Playlist Link:
                    <input type="text" name="search_string" />
                </label>
                <button type="submit">Submit</button>
            </form>
            <div>
                {displayText.map((text, index) => (
                    <p key={index}>{text}</p>
                ))}
            </div>
        </div>
    );
};

export default Main;
