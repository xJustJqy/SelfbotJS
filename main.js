const { fail } = require("assert");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const Discord = require("discord.js");
const { getUnpackedSettings } = require("http2");
const { Delete } = require("snekfetch");
const { token, prefix, giveaway_sniper } = require("./config.json");
const owner = "479705581134020608";
let bumpChannels = [],
  bumpChannelIDs = [],
  bumpChannelIntervals = [];

let client = new Discord.Client({
  disableEveryone: true,
});

client.on("ready", () => {
  console.log("Selfbot is now online.");
  console.log("Logged in as: " + client.user.tag);
});

client.on("message", async (message) => {
  giveawayBot =
    message.author.id.toString() == "716967712844414996" ||
    message.author.id.toString() == "294882584201003009";
  giveawayBot = giveawayBot && giveaway_sniper.toLowerCase() == "on";
  if (message.content.search(/giveaway/i) > -1 && giveawayBot) {
    setTimeout(async () => {
        let r = message.reactions.array();
        if(!r[0]) return;
        if(r[0]._emoji.name != "🎉") return;
      try {
        await message.react("🎉");
        console.log("Giveaway sniped in: " + message.guild.name);
      } catch (err) {
        console.log("Failed to snipe a giveaway in: " + message.guild.name);
      }
    }, 5000);
  }

  if (
    !message.content.startsWith(prefix) ||
    message.author.id.toString() != owner
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd == "test") {
    message.edit("working!");
  }

  if (cmd == "purge") {
    let messagecount = parseInt(args[0]) + 1;

    console.log(typeof messagecount, messagecount);

    if (isNaN(messagecount))
      return message.edit("Must specify the number of messages to delete!");
    i = 0;
    message.channel
      .fetchMessages({ limit: 100 })
      .then(async (messages) => {
        messages = messages.filter((m) => m.author.id === client.user.id);
        messages.forEach((m) => {
          if (i < messagecount) {
            delayLoop(() => {
              purge(m);
            }, i * 600);
          }
          i++;
        });
      })
      .catch(console.error);
  }

  if (cmd == "spam") {
    if (args.length < 2)
      return message.edit(
        `Missing arguments! Usage: ${prefix}spam <amount> <message>`
      );
    num = parseInt(args[0]);
    if (isNaN(num)) return message.edit("Amount must be a number!");
    msg = args.slice(1).join(" ");
    message.delete();
    for (i = 0; i < num; i++) {
      delayLoop(() => {
        message.channel.send(msg).catch(() => {});
      }, i * 600);
    }
  }

  if (cmd == "embed") {
    feilds = message.content.split("|");
    feilds[0] = feilds[0].replace(`${prefix}embed `, "");
    if (feilds.length < 2) {
      return message.edit(
        `Missing arguments! Usage: ${prefix}embed <title> | <content>`
      );
    }
    const embed = new Discord.RichEmbed()
      .setTitle(feilds[0])
      .setDescription(feilds[1]);
    message.delete();
    await message.channel.send(embed);
  }

  if (cmd == "autobump" || cmd == "ab") {
    if (!args[0]) return message.edit("Channel does not exist!");
    channel = client.channels.get(args[0]);
    if (!channel) return message.edit("Channel does not exist!");
    try {
      await channel.send("!d bump");
      bumpChannels.push(channel);
      bumpChannelIDs.push(args[0]);
      bumpChannelIntervals.push(
        setInterval(async () => {
          await channel.send("!d bump");
        }, 1000 * 60 * 60 * 2 + 500)
      );
    } catch (err) {}
  }

  if (cmd == "stopbump") {
    if (!args[0]) return message.edit("Channel does not exist!");
    channel = client.channels.get(args[0]);
    if (!channel) return message.edit("Channel does not exist!");
    console.log(bumpChannelIDs, [channel.id]);
    let index = bumpChannelIDs.indexOf(channel.id);
    if (index == -1) return message.edit("You are not bumping that channel!");
    console.log(index);
    if (index == 0) {
      bumpChannelIDs.shift();
      bumpChannels.shift();
    } else {
      bumpChannels = bumpChannels.splice(index, 1);
      bumpChannelIDs = bumpChannelIDs.splice(index, 1);
    }
    clearInterval(bumpChannelIntervals[index]);
    console.log(bumpChannels);
  }

  if (cmd == "restart") {
    setTimeout(client.destroy(), 0);
  }

  if (cmd == "help") {
    message.delete();
    let autobumping = bumpChannels.length > 0 ? "on" : "none";
    if (autobumping == "on") {
      autobumping = "\n";
      bumpChannels.forEach((c) => {
        let name = c.name;
        let server = c.guild.name;
        autobumping += "\t" + server + ": " + name + "\n";
      });
    }
    message.channel.send(
      "```\nPrefix: " +
        prefix +
        "\nCommands:\n\ttest: Checks if the bot is online\n\tpurge: Deletes messages in bulk\n\tspam: Spams messages\n\tembed: Send a fancy embed!\n\tautobump | ab: Automatically bumps servers that have DISBOARD\n\tstopbump: Stops autobumping a given channel.\n\nSettings:\n\tGiveaway Sniper: "+giveaway_sniper+"\n\nAutoBumping: " +
        autobumping +
        "```"
    );
  }
});

const delayLoop = (fn, delay) => {
  setTimeout(() => {
    fn();
  }, delay);
};

async function purge(m) {
  if (m.author.id == client.user.id) {
    await m.delete(1000).catch(() => {});
  }
}

client.login(token);