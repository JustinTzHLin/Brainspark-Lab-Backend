import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoute from './routes/userRoute.js';
// import quizRoute from './routes/quizRoute.js';
const app = express();
const PORT = 8000;
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World')
})

// server side routing
app.use('/user', userRoute);
// app.use('/quiz', quizRoute);

app.get('*', (req,res) => {return handle(req, res);});

app.use((err, req, res, next) => {
  const defaultObj = {
    log:'Express error handler caught unknown middleware error',
    status: 500,
    message: {err: 'An error occurred'}
  }
  const errObj = Object.assign({}, defaultObj, err);
  console.log(errObj.log);
  return res.status(errObj.status).json(errObj.message);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})