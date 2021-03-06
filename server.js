/***** Creating the server *****/
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

// Require Express.js
const express = require('express')
const app = express()

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
})

// Require coin and database SCRIPT files
const coin = require('./coin.js')
const db = require("./database.js")

// Make Express use its own built-in body parser for both urlencoded and JSON body data.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip ?? null,
        remoteuser: req.user ?? null,
        time: Date.now() ?? null,
        method: req.method ?? null,
        url: req.url ?? null,
        protocol: req.protocol ?? null,
        httpversion: req.httpVersion ?? null,
        secure: req.secure.toString() ?? null, // TODO: is this ok?
        status: res.statusCode ?? null,
        referer: req.headers['referer'] ?? null,
        useragent: req.headers['user-agent'] ?? null
    }

    const stmt = db.prepare(`INSERT INTO accesslogs (remoteaddr, remoteuser, time, 
        method, url, protocol, httpversion, secure, status, referer, useragent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)

    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time,
        logdata.method, logdata.url, logdata.protocol,
        logdata.httpversion, logdata.secure, logdata.status,
        logdata.referer, logdata.useragent)
    next()
})

// Additional (combined format) logging middleware, if log is true
if (allArguments['log'] == true) {
    // Require the fs and morgan modules
    const fs = require('fs') // TODO: should I put this at the top?
    const morgan = require('morgan')
    // Use morgan for logging to files
    // Create a write stream to append (flags: 'a') to a file
    const loggingStream = fs.createWriteStream('access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: loggingStream }))
}


/***** API endpoints *****/
//// Check endpoint ////
app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = HTTP_STATUS_OK
    // Respond with status message "OK"
    res.statusMessage = 'OK'
    res.writeHead(res.statusCode, { 'Content-Type': CONTENT_TYPE_TEXT_PLAIN })
    res.end(res.statusCode + ' ' + res.statusMessage)
});

//// Coin-flipping ////
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

//// Logging and error testing, if debug is true ////
if (allArguments['debug'] == true) {
    // READ a list of access log records (HTTP method GET) at endpoint /app/log/access
    app.get("/app/log/access", (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslogs').all()
            res.status(HTTP_STATUS_OK).json(stmt)
        } catch {
            console.error(e)
        }
    });

    // Error test (taken with modification from thi link:
    // http://expressjs.com/en/guide/error-handling.html)
    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.') // Express will catch this on its own.
    })
}

//// Default response for any request not addressed by the defined endpoints ////
app.use(function (req, res) {
    res.json({ "message": "Endpoint not found. (404)" });
    res.status(HTTP_STATUS_NOT_FOUND);
});


/***** Closing server *****/
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})