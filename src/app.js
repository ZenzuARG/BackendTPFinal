import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import cookieParser from 'cookie-parser';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';
import { connectDB } from './config/db.js';

const __dirname = path.resolve();
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

// Conexión a Mongo
await connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 👈 cookie para cartId
app.use('/static', express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', engine({
  helpers: {
    eq(a, b) { return a === b; }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Guardamos io para usar en los routers
app.set('io', io);

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Socket.IO realtime
const pm = new ProductManager();

io.on('connection', async (socket) => {
  console.log('Cliente conectado a WS');
  socket.emit('products:update', await pm.getAll());

  socket.on('product:create', async (data, cb) => {
    try {
      const created = await pm.create(data);
      const list = await pm.getAll();
      io.emit('products:update', list);
      cb && cb({ ok: true, product: created });
    } catch (err) {
      cb && cb({ ok: false, error: err.message });
    }
  });

  socket.on('product:delete', async (id, cb) => {
    try {
      const ok = await pm.delete(id);
      const list = await pm.getAll();
      io.emit('products:update', list);
      cb && cb({ ok });
    } catch (err) {
      cb && cb({ ok: false, error: err.message });
    }
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
