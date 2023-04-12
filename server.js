import express from "express";
import dotenv from "dotenv";
import pg from "pg";
const { Client } = pg;

const app = express();
app.use(express.static("public"));

dotenv.config();  
const port = process.env.PORT || 3000;

const client = new Client(process.env.DATABASE_URL);
client.connect();

app.use(express.json());

app.get("/", function(req, res) {   
    res.send("Hello, world!");
});

app.get('/api/test', function(req, res) {
    client.query(`SELECT * FROM person`, function(err, response) {
        console.log(err ? err : response.rows)
        res.json(response.rows)
        client.end;
    })
})

app.listen(port, function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server started on port ${port}`);
    }
});
