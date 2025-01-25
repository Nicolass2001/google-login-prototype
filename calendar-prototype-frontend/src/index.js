// simple example how to use express
const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URL = 'http://localhost:3000/redirect';

const oauth2Client = new google.auth.OAuth2({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URL,
});

console.log("client id:", CLIENT_ID);

// Access scopes for read-only Drive activity.
const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email'
];

const app = express();

app.get('/', (req, res) => {

    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
        * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
    });

    res.redirect(authorizationUrl);
})

app.get('/redirect', async (req, res) => {
    // Handle the OAuth 2.0 server response
    const q = req.query;
    console.log('Query:', q);

    if (q.error) { // An error response e.g. error=access_denied
        console.log('Error:' + q.error);
    } else {
        const url = `http://localhost:8000/auth/google?code=${q.code}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        // add the cookie to the response
        res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
        const data = await response.json();
        return res.send(data);
    }
    return res.send('Success');
});

app.get('/protected', async (req, res) => {
    const response = await fetch("http://localhost:8000/auth/protected", {
        method: 'GET',
        headers: {
            // add the cookie to the request
            'Cookie': req.headers.cookie,
            'Content-Type': 'application/json',
        }
    });
    // add the cookie to the response
    res.setHeader('Set-Cookie', response.headers.get('set-cookie'));
    const data = await response.json();
    return res.send(data);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})