# Discord Scrapper Bot

An open-source Discord mirroring solution. 

* **Minimum delay.**
Messages are forwarded immediately, with minimal delay.

* **Channel structure.**
Messages are forwarded to separate channels, preserving the source structure.

* **Easy management.**
Manage the creation, modification and updating of channels for copying in Telegram-bot.

* **Automate updates.**
All you need to do is create a channel to copy, all updates happen automatically.

* **Secure.**
All copied messages are stored in a SQLite database, so you'll still have them even if the source is lost.

## How it works
![](./.github/assets/how-it-works.png)

## Install
Clone repo:
```bash
git clone https://github.com/Chain-Identity/discord-scrapper-bot.git
cd discord-scrapper-bot
```

Setup environment:
```bash
cp example.env .env
nano .env
```

Run:
```bash
docker compose up --build -d
```
