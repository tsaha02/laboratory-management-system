// 1. We start by importing the 'express' library we installed.
// This is like saying, "I need to use the Express engine block now."
import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes'; // Use TypeScript import
import testRoutes from './routes/test.routes';
import packageRoutes from './routes/package.routes';
import appointmentRoutes from './routes/appointment.routes';
import reportRoutes from './routes/report.routes';
import cookieParser from 'cookie-parser'; // <-- Import cookie-parser
import cors from 'cors'; // <-- Import cors

// 2. We create our server, which we'll call 'app'.
export const app = express();
// 3. We pick a 'port' number. A port is like a specific door on your computer.
// Our server will listen for requests at this door. 3000 is a common choice for development.
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173', // Allow requests from our frontend
    credentials: true, // Important for cookies
  })
);
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
app.use('/api/tests', testRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 6. Finally, we tell our 'app' to start listening on the door (port) we chose.
// The message will appear in our terminal to let us know the server has started successfully.
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// 7. That's it! Our server is up and running.
