const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gif")
    .setDescription("Replies with a random gif")
    .addStringOption(option =>
			option
				.setName("keyword")
				.setDescription("Subject/topic for the gif")),
  async execute(interaction) {
    const tag = interaction.options.getString("keyword") ?? ""
    const url = `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_TOKEN}&tag=${tag}&rating=g`
    const response = await fetch(url)
    const data = await response.json()

    await interaction.reply(data.data.url)
  }
}