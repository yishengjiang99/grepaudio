var express = require('express');
const cookieParser = require("cookie-parser");
var app = express();
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const port = process.env.port || 3001;
app.use(cookieParser('12345-67890-09876-54321'));


function auth (req, res, next) {
  console.log(req.headers);
  var authHeader = req.headers.authorization;
  if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
  }

  var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  var user = auth[0];
  var pass = auth[1];
  if (user == 'admin' && pass == 'password') {
      next(); // authorized
  } else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');      
      err.status = 401;
      next(err);
  }
}

app.use(auth);



app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

const mongoose = require("mongoose");
const url = process.env.mongo_uri || 'mongodb://localhost:27017/conFusion';
mongoose.connect(url).then(() =>{
  console.log("mongo db connected");
}).catch((err)=>{
  console.error("mongo db not connected", err);
})

app.use("/", express.static("../public"));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end(err.message); 
});

app.listen(port,()=>{
  console.log("listenign on port ",port);
})
module.exports = app;
