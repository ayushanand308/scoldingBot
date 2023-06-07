import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

let isServerRunning = true;

async function startServer() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const userQuery = `${process.env.PROMPT_TEXT}\nQuestion: ${message.content}\n\
    maintainer:`;
    if (
      message.content.match(/kirat\s*bhaiy+a+/i) ||
      message.content.match(/kirat\s*ba+i+a+/i) ||
      message.content.match(/bhaiy+a+\s*kirat/i) ||
      message.content.match(/ba+i+a+\s*kirat/i) ||
      message.content.match(/harkirat\s*bhaiy+a+/i) ||
      message.content.match(/harkirat\s*ba+i+a+/i) ||
      message.content.match(/bhaiy+a+\s*harkirat/i) ||
      message.content.match(/ba+i+a+\s*harkirat/i)
    ) {
      try {
        const response = await openai.createCompletion({
          prompt: userQuery,
          model: "text-davinci-003",
          max_tokens: 2500,
          temperature: 0.3,
          top_p: 0.3,
          presence_penalty: 0,
          frequency_penalty: 0.5,
        });
        const generatedText = response.data.choices[0].text;
        console.log(generatedText);
        const user = await client.users.fetch(message.author.id);
        user.send(generatedText);
        console.log("dm sent");
      } catch (err) {
        console.error(err);
        console.log("An error occurred. Restarting the server...");
        setTimeout(() => startServer(), 5000); // Restart the server after a delay of 5 seconds
        isServerRunning = false;
      }
    }
  });

  client.login(process.env.BOT_TOKEN);
  console.log("Server running");
}

startServer();
