const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('⏳ Rejestracja komend slash...');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('✅ Komendy slash zarejestrowane lokalnie (dla serwera testowego).');
  } catch (error) {
    console.error('❌ Błąd rejestracji:', error);
  }
})();
