require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, REST, Routes } = require('discord.js');
const { clientId, guildId } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Wczytaj komendy z folderu ./commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Wystąpił błąd podczas wykonywania komendy.', ephemeral: true });
  }
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot zalogowany jako ${client.user.tag}`);

  // Automatyczna rejestracja komend slash
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = client.commands.map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('✅ Komendy slash zarejestrowane automatycznie.');
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
