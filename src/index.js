const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(404).json({error: "User doesn't exists!"});
  }

  request.user = user;

  return next();
}

function checkExistsUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({error: "Todo doesn't exists!"});
  }
  
  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(u => u.username === username);

  if (user) {
    return response.status(400).json({error: "User already exists!"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const deadlineDateFormat = new Date(deadline);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: deadlineDateFormat,
    created_at: new Date()
  }
  
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  const deadlineDateFormat = new Date(deadline);

  todo.title = title;
  todo.deadline = deadlineDateFormat;
  
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { user, todo } = request;
  
  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;