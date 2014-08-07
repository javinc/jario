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

    cLog('Hello my name is ' + magicWord);

    cLog('connecting on device ' + device + ' ...');
    modem.open(device, function(){
        cLog('connected.');
        
        readMsgs();

        // listners
        var received = 'sms received';
        modem.on(received, function(msg) {
            cLog(received); 

            var response = null;

            // check valid msg
            if(checkMagicWord(msg.text)) {
                var command = getCommand(msg.text);

                cLog('command: ' + command);

                // execute command
                bash(command, msg.sender);

                if(response == null) {
                    response = 'Done sir!';
                }
            } else {
                sendMsg(msg.sender, 'You dont know me? just say my name.');
            }
        
            // delete msg
            modem.deleteMessage(1, function(){
                cLog('Message deleted');
            });
        });
    });
}

var checkMagicWord = function(text) {
    return text.indexOf(magicWord) === -1 ? false : true;
}

var sendMsg = function(receiver, text) {
    modem.sms({
        receiver: receiver,
        text: text,
        encoding: '7bit'},
        function(err, sent_ids) {
            if(err) {
                cLog('Error sending sms: ' + err);
            } else{
                cLog('Message sent successfully, here are reference ids: ' +  
                    sent_ids.join(','));
            }
        }
    );
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
        cLog(msg.length);
    });
}

var bash = function(command, sender) {
    var response;
    child = exec(command, function (error, stdout, stderr) {
        // get message
        response = error || stdout || stderr;
        
        cLog(response);

        sendMsg(sender, response);
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
