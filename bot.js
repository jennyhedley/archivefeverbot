console.log("Archive fever bot is starting");

const express = require("express");
const app = express();
app.set("port", process.env.PORT || 5000);

//For avoiding Heroku $PORT error
app
  .get("/", function (request, response) {
    const result = "App is running";
    response.send(result);
  })
  .listen(app.get("port"), function () {
    console.log(
      "App is running, server is listening on port ",
      app.get("port")
    );
  });

//prevent idle with 20 minute ping - haven't tested
// using http://kaffeine.herokuapp.com/ wit 16:45 GMT bedtime
// const http = require("http");
// setInterval(function() {
//     http.get("http://archivefeverbot.herokuapp.com");
// }, 1000 * 60 * 20); // every 20 minutes

require("dotenv").config();
const cron = require("node-cron");
const Twit = require("twit");
const config = require("./config");
const T = new Twit(config);
const getTweet = require("./tweets");
const stream = T.stream("statuses/filter", { follow: "1513305478897750017" });
stream.on("tweet", reply);

/*
// Listen and reply to AnneBotWallace at 4.59am 9.59am and 4.59pm
cron.schedule("59 4,9,16 * * *", () => {
  //reply(msg);
  streamReply();
});

function streamReply() {
  const stream = T.stream("statuses/filter", { follow: "1513305478897750017" });
  stream.on("tweet", reply);
}
*/
// Tweet once a day at 4 GST (local 2pm)

cron.schedule("0 4 * * *", () => {
  tweetIt();
});

function tweetIt() {
  const tweet = {
    status: getTweet(),
  };

  T.post("statuses/update", tweet, tweeted);

  function tweeted(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log("It worked");
    }
  }
}

function reply(msg) {
  const tweet = {
    status: getTweet(),
  };

  const id = msg.id_str;
  const name = msg.user.screen_name;

  T.post(
    "statuses/update",
    {
      //status: "@" + name + " " + tweet.status, //get rid of the @ to delete duplicate tweet
      status: tweet.status,
      in_reply_to_status_id: id,
    },
    function (err, replyMsg) {
      if (err) {
        if (err.message === "Tweet needs to be a bit shorter.") {
          return reply(msg);
        }
        console.log(err.message);
      } else {
        console.log("Tweeted: " + replyMsg.text);
      }
    }
  );
}
