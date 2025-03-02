const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "seuSegredoSuperSeguro";

// Conectar ao MongoDB (use seu banco de dados real aqui)
mongoose.connect("mongodb://localhost:27017/authDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Criar um modelo de usuário
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const User = mongoose.model("User", UserSchema);

// Rota para registrar usuário
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    res.json({ message: "Usuário registrado com sucesso!" });
});

// Rota para login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Senha incorreta!" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Iniciar o servidor
app.listen(5000, () => console.log("Servidor rodando na porta 5000"));
