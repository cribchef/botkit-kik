
/*
  kik api key b7984ae7-9094-4a9d-9aa4-1a3a5ef7ed20
  kik username cribchef
*/

const kik = require("@kikinteractive/kik");

module.exports = function(Botkit, config) {

  var controller = Botkit.core(config);

  controller.defineBot(function(botkit, config) {


      let bot = {
          type: 'kik',
          botkit: botkit,
          config: config || {},
          utterances: botkit.utterances,
      }

      if(!bot.config.username){
        throw new Error("Missing Kik username in parameter");
      }
      if(!bot.config.apiKey){
        throw new Error("Missing Kik api key in parameter");
      }
      if(!bot.config.baseUrl){
        throw new Error("Missing Kik base URL in parameter");
      }

      const kikBot = new kik(bot.config); 
      kikBot.updateBotConfiguration();
      // here is where you make the API call to SEND a message
      // the message object should be in the proper format already
      bot.send = function(message, cb) {
          console.log('SEND: ', message);
          cb();
      }

      // this function takes an incoming message (from a user) and an outgoing message (reply from bot)
      // and ensures that the reply has the appropriate fields to appear as a reply
      bot.reply = function(src, resp, cb) {
        kikBot.onTextMessage((kikMsg) => {

        });
        if (typeof(resp) == 'string') {
          resp = {
            text: resp
           }
        }
        resp.channel = src.channel;
        bot.say(resp, cb);
      }

      // this function defines the mechanism by which botkit looks for ongoing conversations
      // probably leave as is!
      bot.findConversation = function(message, cb) {
          for (var t = 0; t < botkit.tasks.length; t++) {
              for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
                  if (
                      botkit.tasks[t].convos[c].isActive() &&
                      botkit.tasks[t].convos[c].source_message.user == message.user &&
                      botkit.excludedEvents.indexOf(message.type) == -1 // this type of message should not be included
                  ) {
                      cb(botkit.tasks[t].convos[c]);
                      return;
                  }
              }
          }
          cb();
      };

      return bot;

  })


  // provide one or more normalize middleware functions that take a raw incoming message
  // and ensure that the key botkit fields are present -- user, channel, text, and type
  controller.middleware.normalize.use(function(bot, message, next) {

    console.log('NORMALIZE', message);
    next();

  });


  // provide one or more ways to format outgoing messages from botkit messages into 
  // the necessary format required by the platform API
  // at a minimum, copy all fields from `message` to `platform_message`
  controller.middleware.format.use(function(bot, message, platform_message, next) {
      for (var k in message) {
        platform_message[k] = message[k]
      }
      next();
  });


  // provide a way to receive messages - normally by handling an incoming webhook as below!
  controller.handleWebhookPayload = function(req, res) {
      var payload = req.body;

      var bot = controller.spawn({});
      controller.ingest(bot, payload, res);

      res.status(200);
  };


  return controller;

}