// commands/wysokoscpremia.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PREMIA_FILE = path.join(__dirname, '../data/premia.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wysokoscpremia')
    .setDescription('Ustawia wysokość premii za jeden kurs')
    .addNumberOption(option =>
      option.setName('liczba')
        .setDescription('Kwota premii za kurs (bez %), np. 250')
        .setRequired(true)),

  async execute(interaction) {
    const liczba = interaction.options.getNumber('liczba');

    if (liczba <= 0) {
      return await interaction.reply({ content: '❌ Wysokość premii musi być większa od zera.', ephemeral: true });
    }

    fs.writeFileSync(PREMIA_FILE, JSON.stringify({ kwota: liczba }, null, 2));
    await interaction.reply(`✅ Wysokość premii została ustawiona na $${liczba.toFixed(2)} za kurs.`);
  }
};
