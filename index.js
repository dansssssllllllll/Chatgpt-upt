
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

let commands = {};
let installedCommands = {};

function loadCommands() {
  commands = {};
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.name] = command.execute;
  }
}

loadCommands();

app.post('/message', async (req, res) => {
  const input = req.body.message.toLowerCase();
  const cmd = input.split(" ")[0].replace("/", "");

  if (cmd === "install") {
    installedCommands = { ...commands };
    return res.json({ reply: "✅ Commands installed into memory." });
  }

  if (cmd === "reload") {
    loadCommands();
    return res.json({ reply: "🔄 Commands reloaded from folder." });
  }

  if (installedCommands[cmd]) {
    const reply = await installedCommands[cmd](input);
    return res.json({ reply });
  } else {
    return res.json({ reply: "❌ Command not found or not installed. Try /install or /reload first." });
  }
});

app.listen(PORT, () => console.log('Chatbot running on port ' + PORT));
