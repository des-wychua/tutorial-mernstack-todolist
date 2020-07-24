require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');
const PORT = process.env.PORT || 4000;
const app = express();
const todoRoutes = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use('/todos', todoRoutes);

/**
 * Connection to MongoDB
 */
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=admin`, {
    user: `${process.env.DB_USER}`,
    pass: `${process.env.DB_PASS}`,
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connection = mongoose.connection;

connection.on('error', function () {
    throw new Error(`unable to connect to database: mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
});

connection.once('open', function () {
    console.log(`Connected to database: mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);
});

if (process.env.NODE_ENV === "development") {
    mongoose.set('debug', true);
}


/**
 * Web API Routes
 */
todoRoutes.route('/').get(function (req, res) {
    Todo.find(function (err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        };
    });
});

todoRoutes.route('/:id').get(function (req, res) {
    let id = req.params.id;
    Todo.findById(id, function (err, todo) {
        res.json(todo);
    });
});

todoRoutes.route('/').post(function (req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({
                'todo': 'todo added successfully'
            });
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

todoRoutes.route('/:id').patch(function (req, res) {
    Todo.findById(req.params.id, function (err, todo) {
        if (!todo) {
            res.status(404).send("data is not found");
        } else {
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json("todo updated!");
            })
            .catch(err => {
                res.status(400).send("update not possible");
            });
        };
    });
});

todoRoutes.route('/:id').delete(function (req, res) {
    Todo.findById(req.params.id, function (err, todo) {
        if (!todo) {
            res.status(404).send("data is not found");
        } else {
            Todo.deleteOne(todo).then(todo => {
                res.json("todo deleted");
            })
            .catch(err => {
                res.status(400).send("delete not possible");
            });
        };
    });
});

app.listen(PORT, function () {
    console.log('Server started and listening on port: ' + PORT);
});