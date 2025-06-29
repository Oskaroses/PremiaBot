const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('podzielpremie')
    .setDescription('Oblicz premie dla prezesa i menedżera z podanej kwoty firmowej.')
    .addNumberOption(option =>
      option.setName('kwota')
        .setDescription('Dostępna kwota do podziału (saldo firmy)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const kwota = interaction.options.getNumber('kwota');

    const lacznaPremia = kwota * 0.40;
    const prezes = kwota * 0.25;
    const menedzer = kwota * 0.15;
    const pozostale = kwota - lacznaPremia;

    await interaction.reply(
      `💼 Podział premii z ${kwota.toFixed(2)}:\n` +
      `👑 Prezes: $${prezes.toFixed(2)}\n` +
      `🧑‍💼 Menedżer: $${menedzer.toFixed(2)}\n` +
      `🏦 Zostaje w firmie: $${pozostale.toFixed(2)}`
    );
  }
};
