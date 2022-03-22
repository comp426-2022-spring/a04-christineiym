//// Creating the server ////
// Define named constants
const START_ARG_NUM = 2
const DEFAULT_PORT = 3000
const HTTP_STATUS_OK = 200
const HTTP_STATUS_NOT_FOUND = 404
const CONTENT_TYPE_TEXT_PLAIN = 'text/plain'
const HEADS = 'heads'
const TAILS = 'tails'

// Create Require
import { createRequire } from 'module';
const require = createRequire(import.meta.url)

// Require Express.js
const express = require('express')
const app = express()

// Require minimist module to process one argument `--port=` on the command line after `node server.js`.
const minimist = require('minimist')
const { exit } = require('process')

// Define allowed argument name 'port'.
const allArguments = minimist(process.argv.slice(START_ARG_NUM))
const argPort = allArguments['port']

// Define a const `port` using the argument from the command line. 
// Make this const default to port 3000 if there is no argument given for `--port`.
const port = argPort || process.env.PORT || DEFAULT_PORT

// Import the coinFlips and countFlips functions from your coin.mjs file
import { coinFlip, coinFlips, countFlips, flipACoin } from './coin.mjs'

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
})


//// API endpoints ////
// Check endpoint
app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200
    // Respond with status message "OK"
    res.statusMessage = 'OK'
    res.writeHead( res.statusCode, { 'Content-Type' : CONTENT_TYPE_TEXT_PLAIN })
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

// One flip
app.get('/app/flip', (req, res) => {
    var flip = coinFlip()
    res.status(HTTP_STATUS_OK).json({
        'flip': flip
    })
})

// Multiple flips
app.get('/app/flips/:number', (req, res) => {
    var coinFlipsResult = coinFlips(req.params.number)
    var coinFlipsResultSummary = countFlips(coinFlipsResult)

    res.status(HTTP_STATUS_OK).json({
        'raw': coinFlipsResult,
        'summary': coinFlipsResultSummary
    })
});

// Flip match against heads
app.get('/app/flip/call/heads', (req, res) => {
    res.status(HTTP_STATUS_OK).json(flipACoin(HEADS))
})

// Flip match against tails
app.get('/app/flip/call/tails', (req, res) => {
    res.status(HTTP_STATUS_OK).json(flipACoin(TAILS))
})

// Default response for any request not addressed by the defined endpoints
app.use(function (req, res) {
    res.status(HTTP_STATUS_NOT_FOUND).send('404 NOT FOUND')
})