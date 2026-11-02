const fs = require('fs');
const path = require('path');

// Map of loaded commands and aliases
const commands = new Map();
const aliases = new Map();

/**
 * Loads all command modules recursively from commands/ directory
 */
function loadCommands() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  if (!fs.existsSync(commandsPath)) {
    return;
  }

  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      try {
        const filePath = path.join(categoryPath, file);
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        if (command.name) {
          commands.set(command.name.toLowerCase(), command);

          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              aliases.set(alias.toLowerCase(), command.name.toLowerCase());
            }
          }
        }
      } catch (err) {
        console.error(`[Prefix Command Loader] Failed to load ${file}:`, err.message);
      }
    }
  }

  console.log(`[Prefix Command Handler] Successfully loaded ${commands.size} modular commands.`);
}

// Initial load
loadCommands();

/**
 * Handles incoming Discord messages with prefix '!'
 * @param {import('discord.js').Message} message 
 */
async function handlePrefixCommand(message) {
  const prefix = '!';
  if (!message.content.startsWith(prefix) || message.author.bot) return false;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!commandName) return false;

  // Resolve alias or command name
  const targetCommandName = aliases.get(commandName) || commandName;
  const command = commands.get(targetCommandName);

  if (!command) {
    // If not found in modular files, return false so other handlers can check or ignore
    return false;
  }

  try {
    await command.execute(message, args, commandName);
    return true;
  } catch (error) {
    console.error(`[Prefix Command Error] Exception running ${commandName}:`, error);
    message.reply({
      content: `❌ An error occurred while executing \`!${commandName}\`: ${error.message}`
    }).catch(() => {});
    return true;
  }
}

module.exports = {
  handlePrefixCommand,
  loadCommands,
  commands
};
