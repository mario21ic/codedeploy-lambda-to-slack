console.log('Loading function');

const https = require('https');
const util = require('util');
const url = require('url');
const slack_url = 'https://hooks.slack.com/services/tokensadsadjskaldsakl';
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {'Content-Type': 'application/json'};

exports.index = function(event, context) {
    console.log('Records', event.Records);

    var postData = {
        "channel": "#development",
        "username": "AWS",
        "text": "*" + event.Records[0].Sns.Subject + "*",
        "icon_url": "http://emojis.slackmojis.com/emojis/images/1467057057/599/aws.png?1467057057"
    };

    var message = event.Records[0].Sns.Message;
    var severity = "good";

    var dangerMessages = [
        " but with errors",
        " to RED",
        "During an aborted deployment",
        "Failed to deploy application",
        "Failed to deploy configuration",
        "has a dependent object",
        "is not authorized to perform",
        "Pending to Degraded",
        "Stack deletion failed",
        "Unsuccessful command execution",
        "You do not have permission",
        "Your quota allows for 0 more running instance"];

    var warningMessages = [
        " aborted operation.",
        " to YELLOW",
        "Adding instance ",
        "Degraded to Info",
        "Deleting SNS topic",
        "is currently running under desired capacity",
        "Ok to Info",
        "Ok to Warning",
        "Pending Initialization",
        "Removed instance ",
        "Rollback of environment"        
        ];
    
    for(var dangerMessagesItem in dangerMessages) {
        if (message.indexOf(dangerMessages[dangerMessagesItem]) != -1) {
            severity = "danger";
            break;
        }
    }
    
    if (severity == "good") {
        for(var warningMessagesItem in warningMessages) {
            if (message.indexOf(warningMessages[warningMessagesItem]) != -1) {
                severity = "warning";
                break;
            }
        }        
    }

    postData.attachments = [
        {
            "color": severity,
            "text": message
        }
    ];

  var req = https.request(slack_req_opts, function (res) {
    if (res.statusCode === 200) {
      context.succeed('posted to slack');
    } else {
      context.fail('status code: ' + res.statusCode);
    }
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    context.fail(e.message);
  });

  req.write(JSON.stringify(postData, null, '  '));
  req.end();
};

