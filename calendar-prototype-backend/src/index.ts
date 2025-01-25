import express from "express";
import { google } from "googleapis";
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = 'http://localhost:3000/redirect';


const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/redirect", async (req, res) => {
    console.log("Received code:", req.query.code);
    const { tokens } = await oauth2Client.getToken((req.query.code as string));
    // const tokens = {refresh_token: '1//0hijValERNQusCgYIARAAGBESNwF-L9Ir0y9F35FmiT1-hcCANrl__yZrh9oqaonWVVfP_LPx19UXFOGrT_FNfssTm0_14mUoSMg'}
    oauth2Client.setCredentials(tokens);
    console.log('Received tokens:', tokens);

    // Example of using Google Drive API to list filenames in user's Drive.
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eve = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = eve.data.items;
    if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return;
    }
    console.log('Upcoming 10 events:');
    events.map((event, i) => {
        const start = event.start?.dateTime || event.start?.date;
        console.log(`${start} - ${event.summary}`);
    });

    // res.send({jwt: tokens.id_token});
    res.send(events);
});


app.listen(4000, () => {
    console.log("Server is running on port 4000");
});