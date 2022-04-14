console.log("Archive fever bot is starting");

require("dotenv").config();
const Twit = require("twit");
const config = require("./config");

const T = new Twit(config);

const getTweet = require("./tweets");

const stream = T.stream("statuses/filter", { follow: "1513305478897750017" });
stream.on("tweet", reply);

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
