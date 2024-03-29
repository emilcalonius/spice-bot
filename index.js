const { Client, Events, Collection, GatewayIntentBits} = require("discord.js")
require("dotenv").config()
const fs = require('node:fs');
const path = require('node:path');

let isQuizRunning = false

function toggleQuiz() {
	isQuizRunning = !isQuizRunning
}

const client = new Client({
  intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages
	]
})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName === "guess-game" && isQuizRunning) {
		interaction.reply({ content: "Guessing game is already runnning. End the running game before starting a new game!", ephemeral: true })
		return
	}

	if (interaction.commandName === "guess-game" && !isQuizRunning) {
		toggleQuiz()
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		if (interaction.commandName === "guess-game") {
			await command.execute(interaction, toggleQuiz);
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)