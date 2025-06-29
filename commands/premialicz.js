const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premialicz')
    .setDescription('Prześlij plik logów do analizy premii')
    .addAttachmentOption(option =>
      option.setName('plik')
        .setDescription('Plik .txt z logami')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const file = interaction.options.getAttachment('plik');
    if (!file.name.endsWith('.txt')) {
      return await interaction.editReply('❌ Plik musi mieć rozszerzenie .txt');
    }

    const response = await fetch(file.url);
    const text = await response.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const rides = [];
    const matchLog = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Wykorzystanie usługi grupy przez')) {
        const timestamp = line.slice(0, 16);
        const clientMatch = line.match(/przez (.*?)\[/);
        if (!clientMatch) continue;
        const client = clientMatch[1].trim();

        const partnerLine = lines.find(l =>
          l.startsWith(timestamp) &&
          l !== line &&
          l.includes(client) &&
          l.includes('Pasażer')
        );

        if (partnerLine) {
          const driverMatch = partnerLine.match(/kierowca: (.*)/);
          if (!driverMatch) continue;
          const driver = driverMatch[1].trim();
          rides.push(driver);
          matchLog.push(`${timestamp} → ${client} ↔ ${driver}`);
        }
      }
    }

    const stats = {};
    for (const driver of rides) {
      stats[driver] = (stats[driver] || 0) + 1;
    }

    const sorted = Object.entries(stats)
      .map(([driver, count]) => ({ driver, count, total: count * 250 }))
      .sort((a, b) => b.total - a.total);

    const top3 = sorted.slice(0, 3).map((entry, index) =>
      `${index + 1}. ${entry.driver}\n– $${entry.total.toFixed(2)}`
    ).join('\n\n');

    const fullList = sorted.map(entry =>
      `• **${entry.driver}** – $${entry.total.toFixed(2)} (${entry.count} przejazdów)`
    ).join('\n');

    const totalAmount = sorted.reduce((sum, entry) => sum + entry.total, 0);

    const reply = `📅 Wysokość premii za kursy na dzień dzisiejszy ( liczona za okres: **28.06.2025 18:49 → 22.06.2025 22:46** )\n\n` +
      `🏆 **TOP 3 pracowników:**\n\n${top3}\n\n` +
      `📊 **Premie wszystkich kierowców:**\n\n${fullList}\n\n` +
      `💰 **Łączna kwota premii:** $${totalAmount.toFixed(2)}`;

    // Tworzenie pliku tekstowego z logami
    const logText = matchLog.length
      ? matchLog.join('\n')
      : 'Brak dopasowanych przejazdów.';

    const filePath = './logs-premii.txt';
    fs.writeFileSync(filePath, logText);

    const fileAttachment = new AttachmentBuilder(filePath, {
      name: 'logi-premii.txt'
    });

    await interaction.editReply({
      content: reply,
      files: [fileAttachment]
    });

    // Czyszczenie pliku z dysku
    setTimeout(() => fs.unlink(filePath, () => {}), 10_000);
  }
};
