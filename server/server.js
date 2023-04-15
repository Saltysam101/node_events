// Complete Events Exercise

const { EventEmitter } = require("events");
const { createServer } = require("http");
const path = require("path");
const { appendFile, readFile } = require("fs");


const NewsLetter = new EventEmitter();


const server = createServer((req, res) => {
    const chunks = [];
    let { url, method } = req;

    req.on("error", (err) => {
        console.error(err);
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ msg: "Invalid Request" }));
        res.end();
    })

    res.on("error", (err) => {
        console.error(err);
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ msg: "Server Error" }));
        res.end();
    })

    req.on("data", (chunk) => {
        chunks.push(chunk)
    })

    req.on("end", () => {

        if (url = "/newsletter_signup" && method === "POST") {
            const body = JSON.parse(Buffer.concat(chunks).toString())

            const newContact = `${body.name}, ${body.email}\n`
            NewsLetter.emit("signup", newContact, res);

            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({ msg: "Successfully signed up for a newsletter!" }));
            res.end();
        } else if (url = "/newsletter_signup" && method === "GET") {
            readFile(path.join(__dirname, "../public/index.html"), (err, data) => {
                if (err) {
                    console.log(err);
                    res.emit("error", err);
                    return
                }
                res.setHeader("Content-Type", "text/html");
                res.write(data)
                res.end();
            })
        } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({ msg: "Not a valid endpoint" }));
            res.end();
        }
    })
})

server.listen(3000, () => console.log("listening on port 3000"))

NewsLetter.on("signup", (newContact, res) => {
    appendFile(path.join(__dirname, "/newsletter.csv"), newContact, (err) => {
        if (err) {
            console.error(err);
            NewsLetter.emit("error", err, res)
            return
        }
        console.log("file was updated")
    })
})

NewsLetter.on("error", (err, res) => {
    console.log(err)
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Error adding contact to newsletter" }));
    res.end();
})