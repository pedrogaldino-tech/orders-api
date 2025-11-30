const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Conexão MongoDB
mongoose.connect("mongodb://localhost:27017/ordersDB");

// Schema
const itemSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  value: Number,
  creationDate: Date,
  items: [itemSchema]
});

const Order = mongoose.model("Order", orderSchema);

// Criar pedido
app.post("/order", async (req, res) => {
  try {
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;
    const order = new Order({
      orderId: numeroPedido,
      value: valorTotal,
      creationDate: new Date(dataCriacao),
      items: items.map(i => ({
        productId: parseInt(i.idItem),
        quantity: i.quantidadeItem,
        price: i.valorItem
      }))
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter pedido
app.get("/order/:id", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(order);
});

// Listar pedidos
app.get("/order/list", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Atualizar pedido
app.put("/order/:id", async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    req.body,
    { new: true }
  );
  res.json(order);
});

// Deletar pedido
app.delete("/order/:id", async (req, res) => {
  await Order.deleteOne({ orderId: req.params.id });
  res.json({ message: "Pedido deletado" });
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
