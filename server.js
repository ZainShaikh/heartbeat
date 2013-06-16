// module dependencies.
var application_root = __dirname,
    express = require('express'), // web framework
    path = require('path');  // utilities for dealing with file paths


// create server
var app = express();


// configure server
app.configure(function () {

    if (app.get('env') === 'development') {
        app.use(express.responseTime());
        app.use(express.logger('tiny'));

        // show all errors in development
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    }

    // parse data posted via body
    app.use(express.bodyParser());

    // where to serve static content
    app.use(express.static(path.join(application_root, 'public')));
    
    // perform route lookup based on url and HTTP method
    app.use(app.router);

});



// global object to store all connected users
var all_users = {};



// -- Routes -------------------------------------------------------------------

app.get('/api/messages/stream', function (req, res) {
    
    // get user agent
    var user_agent = req.headers['user-agent'];

    // fetch user from global list based on user agent
    var user = all_users[user_agent] || (all_users[user_agent] = {});

    console.log(all_users);

    // init timer to continuously check if new messages are available or not
    var counter = 0;
    var timer = setInterval(function () {

        counter++;


        // if messages found then 
        // fetch all messages for current user
        // and return
        if (user && user.messages && user.messages.length) {


            // clear interval so that it is not invoked again
            clearInterval(timer);

            // prepare returning object
            var json = {
                messages: []
            };

            // pop all messages and add to json object
            for (var m in user.messages) {
                if (user.messages.hasOwnProperty(m)) {
                    var p = user.messages.pop();
                    p && json.messages.push(p);
                }
            }

            // log for debugging
            console.log(user);
            console.log(json);

            // return response
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Length', json.length);
            res.send(json);
            res.end();

        }
        else {

            // keep comet for 5secs only
            if (counter == 25) {

                // clear interval now
                // so that client should issue a new request
                clearInterval(timer);

                // prepare empty object to return
                var json = { messages: [], error: "no new messages" };

                // return response
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Length', json.length);
                res.send(json);
                res.end();
            }
        }


    }, 200);

});


app.post('/api/messages/new', function (req, res) {

    // get message from post body
    var message = req.body.message;

    // store message for all users 
    for (var u in all_users) {
        if (all_users.hasOwnProperty(u)) {
            var user = all_users[u];
            user.messages = user.messages || [];
            user.messages.push(message);
        }
    }

    // prepare json object
    var json = { message: message };

    // return response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', json.length);
    res.send(json);
    res.end();
});






// -- Server -------------------------------------------------------------------
var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log('Listening on port %d in %s mode', port, app.settings.env);
});