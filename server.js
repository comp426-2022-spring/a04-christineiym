//// Creating the server ////
// Define named constants
const START_ARG_NUM = 2
const EXIT_SUCCESS = 0
const DEFAULT_PORT = 3000
const HTTP_STATUS_OK = 200
const HTTP_STATUS_NOT_FOUND = 404
const CONTENT_TYPE_TEXT_PLAIN = 'text/plain'
const HEADS = 'heads'
const TAILS = 'tails'

// Require minimist module to process arguments.
const minimist = require('minimist')
const { exit } = require('process')
const allArguments = minimist(process.argv.slice(START_ARG_NUM))

// Print help message if asked for.
if (allArguments['help']) {
    console.log(`server.js [options]

    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
  
    --debug	If set to \`true\`, creates endpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                \`false\`.
  
    --log	If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
  
    --help	Return this message and exit.`)
    exit(EXIT_SUCCESS)
}

// Define a const `port` using the argument from the command line. 
// Make this const default to port 3000 if there is no argument given for `--port`.
const port = allArguments['port'] || process.env.PORT || DEFAULT_PORT

// Import the coinFlips and countFlips functions from your coin.mjs file
const coin = require('./coin.js')

// Require Express.js
const express = require('express')
const app = express()

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
    var flip = coin.coinFlip()
    res.status(HTTP_STATUS_OK).json({
        'flip': flip
    })
})

// Multiple flips
app.get('/app/flips/:number', (req, res) => {
    var coinFlipsResult = coin.coinFlips(req.params.number)
    var coinFlipsResultSummary = coin.countFlips(coinFlipsResult)

    res.status(HTTP_STATUS_OK).json({
        'raw': coinFlipsResult,
        'summary': coinFlipsResultSummary
    })
});

// Flip match against heads
app.get('/app/flip/call/heads', (req, res) => {
    res.status(HTTP_STATUS_OK).json(coin.flipACoin(HEADS))
})

// Flip match against tails
app.get('/app/flip/call/tails', (req, res) => {
    res.status(HTTP_STATUS_OK).json(coin.flipACoin(TAILS))
})

// Default response for any request not addressed by the defined endpoints
app.use(function (req, res) {
    res.status(HTTP_STATUS_NOT_FOUND).send('404 NOT FOUND')
})