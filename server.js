const axios = require("axios");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

let submissionCount = 0;

const KEY = process.env.WEBHOOK_KEY;

function f() {
  axios
    .get("https://codeforces.com/api/user.status?handle=anxmukul")
    .then(response => {
      const submissions = response.data.result;
      if (submissions.length != submissionCount) {
        submissionCount = submissions.length;
        const lastSubmission = submissions[0];
        const problemName = lastSubmission.problem.name;
        const language = lastSubmission.programmingLanguage;
        const result = lastSubmission.verdict;
        let slackMessage;
        if (result === "OK") {
          slackMessage = `Submission for *${problemName}* in _${language}_ passed :tada:`;
        } else {
          slackMessage = `Submission for *${problemName}* in _${language}_ failed with \`${result}\` :ghost:`;
        }
        axios
          .post(
            `https://hooks.slack.com/services/${KEY}`,
            JSON.stringify({ text: slackMessage }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            }
          )
          .then(function() {
            console.log("Santiago sent a message");
          })
          .catch(function(error) {
            console.log("Santiago encountered an error", error);
          });
      }
    })
    .catch(error => {
      console.log(error);
    });
}
app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

setInterval(function() {
  f();
}, 1000);
