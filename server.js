const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
var cors = require('cors');
const port = 8000;

let users; // this is an asynchronous call 
fs.readFile(path.resolve(__dirname, './data/users.json'), function(err, data) { // this is done at start up of server
  console.log('reading file ... ');
  if(err) throw err;
  users = JSON.parse(data);
})

const addMsgToRequest = function (req, res, next) { // Middleware
  if(users) {
    req.users = users;
    next();
  }
  else { 
    return res.json({
        error: {message: 'users not found', status: 404}
    });
  }
  
}

app.use( 
  cors({origin: 'http://localhost:3000'})
);
app.use('/read/usernames', addMsgToRequest); 
app.get('/read/usernames', (req, res) => { 
  let usernames = req.users.map(function(user) {
    return {id: user.id, username: user.username}; 
  });
  res.send(usernames); 
});


app.use(`/read/username`, addMsgToRequest);
app.get(`/read/username/:name`, (req, res) => {
  let name = req.params.name;
  let users_with_name = req.users.filter(function(user) {
    return user.username === name;
  });
  console.log(users_with_name);
  if (users_with_name.length === 0) {
    res.send({
      error: {message: `${name} not found`, status: 404}
    });
  }
  else {
    res.send(users_with_name);
  }
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/write/adduser', addMsgToRequest);

app.post('/write/adduser', (req, res) => { 
  let newuser = req.body;
  req.users.push(newuser);
  fs.writeFile(path.resolve(__dirname, './data/users.json'), JSON.stringify(req.users), (err) => { 
    if (err) console.log('Failed to write');
    else console.log('User Saved');
  });
  res.send('done');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})