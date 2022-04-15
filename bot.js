console.log("Archive fever bot is starting");
// const PORT = process.env.PORT || 80;

require("dotenv").config();
const cron = require("node-cron");
const Twit = require("twit");
const config = require("./config");

const T = new Twit(config);

const getTweet = require("./tweets");

// Tweet once a day at 3pm
cron.schedule("0 15 * * *", () => {
  tweetIt();
});

// Listen and reply to AnneBotWallace at 4.59am 9.59am and 4.59pm
cron.schedule("59 4,9,16 * * *", () => {
  //reply(msg);
  streamReply();
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

function streamReply() {
  const stream = T.stream("statuses/filter", { follow: "1513305478897750017" });
  stream.on("tweet", reply);
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
      status: "@" + name + " " + tweet.status,
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
