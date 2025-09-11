// 1. We start by importing the 'express' library we installed.
// This is like saying, "I need to use the Express engine block now."
import express from 'express';
import authRoutes from './routes/auth.routes'; // Use TypeScript import
import cookieParser from 'cookie-parser'; // <-- Import cookie-parser

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error(
    'FATAL ERROR: JWT secrets are not defined in environment variables.'
  );
  process.exit(1);
}

// 2. We create our server, which we'll call 'app'.
const app = express();
// 3. We pick a 'port' number. A port is like a specific door on your computer.
// Our server will listen for requests at this door. 3000 is a common choice for development.
const port = 3000;

// This middleware is crucial for parsing JSON request bodies
app.use(express.json());
app.use(cookieParser());

// 4. We define a 'route'. This tells the server what to do when it gets a web request.
// This rule says: "When a GET request comes to the main URL ('/'), run this function."
// 'req' holds information about the incoming request.
// 'res' is what we'll use to send our response back.
app.get('/', (req, res) => {
  // 5. We send a response. Here, it's just a simple text message.
  res.send('Hello from the Laboratory Management Backend!');
});

app.use('/api/auth', authRoutes);

// 6. Finally, we tell our 'app' to start listening on the door (port) we chose.
// The message will appear in our terminal to let us know the server has started successfully.
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// 7. That's it! Our server is up and running.
