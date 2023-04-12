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

app.get('/api', function(req, res) {
    client.query(`SELECT * FROM todo`, function(err, response) {
        console.log(err ? err : response.rows)
        res.json(response.rows)
    })
});

app.get('/api/:id', (req,res) => {
    let id = req.params.id;

    if(isNaN(id)) {
        res.status(404).send("Enter a valid ID");
        return;
    }
    client.query(`SELECT * FROM todo WHERE id = $1`, [id])
    .then((result) => {
        if(result.rows.length == 0) {
            res.status(404).send("The entry does not exist");
            return;
        } else {
            res.status(200).send(result.rows);
        }
    })
})

app.post('/api/todo',function(req,res){
    client.query(`INSERT INTO todo (task,start_date,deadline) VALUES ($1,$2,$3) RETURNING *`,[
        req.body.task,
        req.body.start_date,
        req.body.deadline
    ])
    .then((result) => {
        res.send(result.rows);
    });
});

app.patch('/api/todo/:id',(req,res) => {
    let id = req.params.id;
    let data = req.body;

    if(isNaN(id)) {
        res.status(404).send("Enter a valid task ID");
        return;
    }
    client.query(`SELECT * FROM todo WHERE id = $1;`, [id])
    .then((result) => {
        if (result.rows.length == 0) {
            res.status(404).send("The task you are trying to update is not here");
            return;
        } else {
            const query = `UPDATE todo SET task = COALESCE ($1, task), start_date = COALESCE ($2, start_date), deadline = COALESCE ($3,deadline) WHERE id = $4 RETURNING *`;
            const values = [data.task || null, data.start_date || null, data.deadline || null, id];
            client.query(query,values)
            .then((result) => {
                result = result.rows[0];
                res.status(201).send(result);
            })
        }
    })
})

app.delete("/api/todo/:id", (req,res) => {
    let id = req.params.id;
    if(isNaN(id)) {
        res.status(404).send("Enter a valid task ID");
        return;
    }
    client.query(`SELECT * FROM todo WHERE id = $1;`, [id]).then((result) => {
        if(result.rows.length == 0) {
            res.status(404).send("The task you are trying to delete does not exist");
            return;
        } else {
            client.query(`DELETE FROM todo WHERE id = $1 RETURNING *;`, [id])
            .then((result) => {
                let deletedTaskName = result.rows[0].task;
                res.status(200).send(`"${deletedTaskName}" has been deleted`);
            })
        }
    })
})




app.put('/api/todo/:id', (req, res) => {
    let taskId = req.params.id;
    let { task, start_date, deadline } = req.body;
  
    // Update the task in the database
    client.updateTask(taskId, task, start_date, deadline)
      .then(() => {
        // Send a success response
        res.status(200).json({ message: 'Task updated successfully' });
      })
      .catch((error) => {
        // Handle any errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      });
  });
  

app.listen(port, function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server started on port ${port}`);
    }
});
