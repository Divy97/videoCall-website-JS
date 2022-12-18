const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const PORT = 8080;
const APP_ID = "64bbc7185bcf466c93c8cd1359b8bcb2";
const APP_CERTIFICATE = "e838c05f78014fd7963d5d3657165f47E";

const app = express();

const nocache = (req, resp, next) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

const generateAccessToken = (req, resp) => {
  resp.header("Access-Control-Allow-Origin", "*");

  const room = req.query.room;
  if (!room) {
    return resp.status(500).json({ error: "channel is required" });
  }

  let uid = req.query.uid;
  if (!uid || uid == "") {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == "publisher") {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    room,
    uid,
    role,
    privilegeExpireTime
  );

  return resp.json({ token: token, uid: uid });
};
app.get("/", nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
