var child,
    magicWord = 'jario',
    exec = require('child_process').exec,
    modem = require('modem').Modem(),
    device = process.argv[2];

var main = function() {
    // checker
    if(!device) {
        err('device not specified');
    }

    cLog('Hello Commander');

    cLog('connecting on device ' + device + ' ...');
    modem.open(device, function(){
        cLog('connected.');
        
        // readMsgs();

        // listners
        var received = 'sms received';
        modem.on(received, function(msg) {
            cLog(received); 

            // check valid msg
            if(checkMagicWord(msg.text)) {
                var command = getCommand(msg.text);

                cLog('command: ' + command);

                // execute command
                var response = bash(command);
            } else {
                cLog('You dont know me? just say my name.');
            }
        });
    });
}

var checkMagicWord = function(text) {
    return text.indexOf(magicWord) === -1 ? false : true;
}

var getCommand = function(text) {
    // split them by new line
    var chunks = text.split("\n");

    for (var i = 0; i < chunks.length; i++) {
        var segment = chunks[i];
        if(segment.indexOf(magicWord) !== -1) {
            return segment.replace(magicWord, '').trim();
        }
    };

    return 'Hey, say something!';
}

var readMsgs = function() {
    cLog('getting messages...');
    modem.getMessages(function(msg){
        cLog(msg);
    });
}

var bash = function(command) {
    child = exec(command, function (error, stdout, stderr) {
        // get message
        var response = stdout || stderr || error;

        cLog(response);

        return response;
    });
}

var err = function(msg) {
    cLog('Err: ' + msg);
    process.exit();
}

var cLog = function(msg) {
    console.log(msg);
}

// call main method
main();
