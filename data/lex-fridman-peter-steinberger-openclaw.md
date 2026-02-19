# OpenClaw: The Viral AI Agent that Broke the Internet — Peter Steinberger

**Источник:** [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger-transcript)  
**Гость:** Peter Steinberger (создатель OpenClaw)

Разговор об OpenClaw — открытом AI-агенте, который за несколько дней набрал более 180 000 звёзд на GitHub: история создания, самоизменяемый код, безопасность, агентная разработка, Codex vs Claude, будущее приложений и программистов.

---

## Transcript (фрагмент)

### Episode highlight

**Peter Steinberger (00:00:00)** I watched my agent happily click the "I'm not a robot" button. I made the agent very aware. Like, it knows what his source code is. It understands how it sits and runs in its own harness. It knows where documentation is. It knows which model it runs. It understands its own system that made it very easy for an agent to… Oh, you don't like anything? You just prompted it to existence, and then the agent would just modify its own software. People talk about self-modifying software, I just built it. I actually think vibe coding is a slur.

**Lex Fridman (00:00:31)** You prefer agentic engineering?

**Peter Steinberger (00:00:33)** Yeah, I always tell people I do agentic engineering, and then maybe after 3:00 AM, I switch to vibe coding, and then I have regrets on the next day.

### OpenClaw origin story

**Lex Fridman (00:05:36)** Let's go to this moment when you built a prototype in one hour, that was the early version of OpenClaw. I think this story's really inspiring to a lot of people because this prototype led to something that just took the internet by storm… and became the fastest-growing repository in GitHub history, with now over 175,000 stars. So, what was the story of the one-hour prototype?

**Peter Steinberger (00:06:20)** You know, I wanted that since April. A personal assistant. AI personal assistant. Yeah. And I played around with some other things, like even stuff that gets all my WhatsApp, and I could just run queries on it. That was back when we had GPT-4.1, with the one million context window. And I pulled in all the data and then just asked him questions like, "What makes this friendship meaningful?" And I got some really profound results. Like, I sent it to my friends and they got teary eyes. […] And then my search bar was literally just hooking up WhatsApp to Claude Code. One shot. The CLI message comes in. I call the CLI with -p. It does its magic, I get the string back and I send it back to WhatsApp. And I built this in one hour. And I felt… Already felt really cool. It's like, "Oh, I could… I can talk to my computer," right?

### Mind-blowing moment

**Peter Steinberger (00:16:08)** I literally went, "How the fuck did he do that?" And it was like, "Yeah, the mad lad did the following. He sent me a message but it only was a file and no file ending." So I checked out the header of the file and it found that it was, like, opus so I used ffmpeg to convert it and then I wanted to use whisper but it didn't had it installed. But then I found the OpenAI key and just used Curl to send the file to OpenAI to translate and here I am. You didn't teach it any of those things and the agent just figured it out, did all those conversions, the translations. It figured out the API, it figured out which program to use, all those kinds of things.

*(В эпизоде также: Why OpenClaw went viral, Self-modifying AI agent, Name-change drama, Moltbook saga, Security, How to code with AI agents, GPT Codex 5.3 vs Claude Opus 4.6, Life story, Acquisition offers from OpenAI and Meta, How OpenClaw works, AI slop, AI agents will replace 80% of apps, Will AI replace programmers?.)*

---

**Полный транскрипт:** https://lexfridman.com/peter-steinberger-transcript
