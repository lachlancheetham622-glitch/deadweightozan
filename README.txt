DEADWEIGHT - multiplayer spaceship deception game
=================================================

QUICK START - pick ONE way to play (read "WHY ROOM NOT FOUND HAPPENS" below!)
=============================================================================
  1) PLAY ALONE vs BOTS (no server, no internet)
       Open index.html (keep engine.js next to it) -> "Play offline vs bots".

  2) ON YOUR OWN COMPUTER / SAME WI-FI
       Windows: double-click  "Start Deadweight (Windows).bat"
       Mac:     double-click  "Start Deadweight (Mac).command"
       Other:   run  ./start.sh   (or:  node server.js)
       (Needs Node.js from nodejs.org. No npm install, no dependencies.)
       It opens the game in its own app window. The lobby shows a Wi-Fi link for
       friends. School Wi-Fi often blocks computers from reaching each other, so for
       school use option 3.

  3) HOST IT ONLINE = what you want for school (everyone just opens one link)
       See "HOST IT ONLINE" below. Takes ~5 minutes, free.

ROLES (22 special roles, switch them on with "Special roles" in the lobby)
  NEUTRAL (their own goal; their tasks are fake and never count toward the crew's progress)
            Jester       Get voted out to win.
            Executioner  You get a secret TARGET (a normal crewmate). Get them voted out in a meeting and you
                         win. If they die any other way you become a Jester instead.
            Survivor     Win by being alive when the game ends, no matter who wins. F: put on a vest (2 uses,
                         20s cooldown) that blocks the next attack on you.
            Vulture      F next to a body: devour it (12s cooldown). Eat 3 bodies and you win on the spot.
  CREW      Sheriff      Q: shoot someone. Hit an impostor and they die, hit an innocent and you die.
            Engineer     V: use vents (3 times, 15s each). Others who see you will suspect you.
            Mayor        Your vote counts as two in meetings.
            Medic        F: shield a nearby player (one use). The shield blocks the next kill on them.
                         You see who is shielded. Shielded players see a blue ring.
            Detective    F: examine a body (3 uses) and get 3 names, one of them the killer.
                         Clues are kept in your notes in the meeting chat.
            Tracker      F next to a player: plant a tracker (3 uses). For 45s an arrow at the edge of your
                         screen points at them wherever they go (6s between tags).
            Trapper      F: lay a tripwire where you stand (3 uses). The first person to step on it is named
                         in your notes. A Morphling is reported as the player they copy, and a vanished
                         Phantom trips it without being named.
            Paramedic    F next to a body: REVIVE the player (one use, only within 30s of the death). They
                         stand back up where they fell. A shot impostor cannot be revived.
            Bodyguard    F next to a player to guard them (15s to change ward). If an impostor attacks your
                         ward while you are within about 5 tiles, you take the blow and die instead and
                         the attack fails. Your body shows who did it (the Detective can use that).
            Oracle       Passive. Every meeting your visions name one player who is NOT an impostor (it
                         saves in your notes, and won't repeat until it has named everyone).
            Snitch       Passive. With 2 tasks left you SEE the impostors (red names). With 1 task left the
                         impostors get an arrow pointing at you. Finish before they get to you.
            Pilot        F: drop a beacon. F again, from anywhere: warp back to it (30s cooldown). Nearby
                         players see you blink away.
  IMPOSTOR  Cleaner      F: wipe a nearby body away (25s cooldown).
            Phantom      F: vanish for 7s (40s cooldown). Crew cannot see you, you cannot attack, and you can
                         WALK THROUGH WALLS AND OBJECTS (only the edge of the map stops you). When the
                         vanish ends you are moved to the nearest open floor if you are inside a wall, so
                         plan your exit.
            Morphling    F next to a player: copy their color and name for 15s (35s cooldown). Crew (and
                         crew bots) see the copied player. A kill while disguised gets them blamed.
            Saboteur     F: lights out for 12s (45s cooldown). Crewmates' vision shrinks to about a third;
                         impostors still see normally.
            Silencer     F next to a crewmate (35s cooldown): they cannot chat in the NEXT meeting. They
                         get told when the meeting starts and can still vote.
            Hunter       No special button: your kill cooldown is 14s instead of 20s.
  Bots can be any of these too (bot Paramedics revive fresh bodies, bot Bodyguards guard, bot Trappers lay
  wires and remember who tripped them, bot Snitches know the impostors, and impostor bots hunt an exposed Snitch). Role chances and the minimum player count for each are in
  startGame() in engine.js; ability timings are the constants at the top of engine.js
  (CLEAN_CD, PHANTOM_T, MORPH_T, DARK_T, SILENCE_CD, HUNTER_CD, VEST_USES, VULT_NEED, TRACK_T, TRAP_USES, REVIVE_T, GUARD_R, PILOT_CD ...).
  Roles per game: 1 neutral role in small games (2 from 8 players up), a few crew roles, and every
  impostor gets a different impostor role. Minimum players: Jester 4, Executioner 5, Survivor 5,
  Vulture 6 (the lobby fills up to 10 with bots by default).

TASKS (new: 15 different kinds)
  Wires, tap 1-9 in order, upload/download a file, stop-the-marker (scan / targeting),
  tune a signal, line up engine bars, keep the output steady (hold/release balance),
  Simon-style memory pads (reactor / shields), flip switches to match a pattern (each
  switch also flips its neighbour), spot the odd camera, sort cargo into bins, pour fuel to
  the line, memorise and enter an ID code, clear asteroids, scrub a filter clean.
  Which game a task uses is the third value of each row in STATIONS in engine.js, and the
  games themselves are the mg... functions in index.html.

PLAY ONLINE FROM THE APP + PUBLIC SERVER BROWSER (new)
=====================================================
  The app (installed app, the double-click launchers, or a copy of index.html on your
  computer) can now play online on ANY hosted Deadweight server, not only the one it was
  opened from.
    * Menu -> "Nearby public servers" opens the server browser. It shows every public
      room waiting in a lobby on every server you know, with host name, players, impostor
      count and ping. Press Join and you are in. It refreshes by itself every few seconds.
    * To use a hosted server (for example your Render link), type its address into the
      "Add a server" box in the browser. It is saved and used for Create room / Join.
      "Use" switches between saved servers; the star marks the one you are on.
    * Pasting a friend's invite link into the Join box now switches to their server
      instead of leaving the app.
    * "Public room" checkbox (menu, and in the lobby for the host): public lobbies are listed
      in the browser for anyone on that server. Private rooms (default) still need the code.
      Only lobbies that have not started and are not full can be joined from the list.
    * Want the app to know your server from the start? Put its address into DEFAULT_SERVER
      near the top of the script in index.html.
  Notes: servers need to be updated to this version (they provide /rooms). An https page can
  only reach https servers (or localhost). The browser lists servers you add; it cannot
  scan your Wi-Fi by itself, so nearby = the servers you saved (add your Wi-Fi address,
  e.g. 192.168.1.20:3000, to see games on your own network).

WHY "ROOM NOT FOUND" HAPPENS (and what is fixed)
=================================================
  A room lives in the memory of ONE server. "Room not found" means the server you
  are connected to doesn't have that room. The usual reasons:
    * You and your friend are on DIFFERENT servers (for example each of you ran
      your own copy, or one is on localhost and one on a website). Fix: everybody
      must open the SAME link. The lobby shows the address and a "server xxxx" id;
      if two players see different server ids, they are not on the same server.
    * The server restarted or fell asleep (free hosts do this when idle), which
      wipes every room. NOW FIXED: the host's page automatically re-creates the
      lobby with the SAME code and everyone else keeps retrying to rejoin it.
    * A player dropped off the wifi for a moment. NOW FIXED: automatic reconnect.
    * Typing the code before the host made it. NOW FIXED: "Looking for room..."
      keeps trying for ~15 seconds before giving up.
  You can also paste the host's whole invite link into the Join box (it opens the
  host's page for you), and codes are not case sensitive.
  If a game is already running when the connection dies, that match can't be
  recovered (only lobbies can), you just go back to the menu.

HOST IT ONLINE (free, best for school Wi-Fi)
=============================================
  Why: a normal https:// link works on school networks, nobody needs Node.js, and
  everyone is automatically on the same server. Render.com's free plan works:
    1. Make a free account on github.com. Create a New repository, click
       "uploading an existing file", drag in EVERYTHING from this folder
       (index.html, engine.js, server.js, package.json, render.yaml, the .png icons,
       manifest.webmanifest, sw.js...). Commit.
    2. Make a free account on render.com (log in with GitHub).
       New + -> Blueprint (it reads render.yaml)  OR  New + -> Web Service, pick your
       repo, Runtime Node, Build Command empty, Start Command  node server.js,
       Instance Type Free.
    3. Wait for the deploy. Render gives you a link like
       https://deadweight-abcd.onrender.com  - give THAT link to everyone.
    4. Free instances sleep after ~15 idle minutes: the first visit then takes ~30-60
       seconds. Open the link a minute before playing. While anyone has the game
       open, the page pings the server so it stays awake, and if it ever does restart,
       lobbies come back by themselves.
  Other hosts that work with the included files: Railway, Fly.io, Koyeb, any VPS
  (a Dockerfile and Procfile are included). Needs WebSocket support (all of these have it).
  Don't want accounts? Run the server on one computer and use a tunnel:
       cloudflared tunnel --url http://localhost:3000
  and share the https link it prints (some schools block tunnel domains).

INSTALL IT AS AN APP (icon on your desktop / taskbar)
=====================================================
  Open the hosted https:// link in Chrome or Edge:
    * Click the "Install Deadweight as an app" button on the menu (or the install icon
      at the right end of the address bar, or menu -> "Install Deadweight" / "Save and
      share -> Install page as app"). It gets its own window and an icon in the Start
      menu / taskbar. Right-click the taskbar icon -> Pin.
    * Phone: browser menu -> "Add to Home screen" (iPhone: Share -> Add to Home Screen).
  Once installed, "Play offline vs bots" works even with no internet at all.
  (Browsers only allow installing from https:// or localhost, not from a Wi-Fi
  address like http://192.168.x.x.)
  The double-click launchers also open the game in a standalone app window.

CHECKLIST WHEN SOMEONE CAN'T JOIN
=================================
  [ ] Same link? (look at the address in the lobby, and the "server xxxx" id)
  [ ] Host still has the lobby open (it survives ~3 minutes without the host)
  [ ] Free host asleep? Open the link, wait for the page, then try again
  [ ] Not opened by double-clicking index.html (that's offline-only)
  [ ] The server's console prints every room created / join / unknown code

BOT CHAT (meetings)
  Bots remember where they were and who they saw. In meetings they give alibis,
  answer questions you ask them (use their name: "Nova where were you?"), defend
  themselves when accused, ask suspects questions, call out anyone whose story
  doesn't match what they saw, point out players who ignore questions, and vote
  based on who they suspect. Impostor bots lie and try to frame people.
  You can type room names (Electrical, Cafeteria...) and player names or colors.
  Each bot has its own texting voice (lowercase, "u/ur", "ngl", "fr", the odd emoji),
  uses lots of different phrasings, and they talk slowly: one bot at a time with a
  gap in between, and not every bot speaks up every meeting.
  Meetings now have 60 seconds of discussion.

  Without an API key the bots use the built-in chat logic (see above). It now always reacts to what
  you type: if you ask a question, name a bot, accuse someone or just say something, at least one bot
  answers a few seconds later instead of ignoring you.

  REAL AI BOTS (optional, needs the node server): before starting the server set
    ANTHROPIC_API_KEY=your_key     (Windows cmd: set ANTHROPIC_API_KEY=your_key)
  Then EVERY bot is its own separate AI agent (its own Claude call, nothing is shared between bots):
    * its own personality (analytical, hype, quiet, sarcastic, paranoid, blunt leader, peacemaker...)
    * its own secret role and private notes: where it really was, who it saw and where, anything
      it saw (like a vent), who it suspects, and what happened in earlier meetings. Impostor
      bots know their teammate and get a consistent alibi to lie with.
    * it READS the meeting chat. Bots whose name/colour you type must answer you; a bot you
      replied to reacts to your answer; at least one bot always responds when a person talks;
      the others chime in or speak up on their own when they have something to add.
    * at voting time each bot AI decides its own vote (and can say why in chat).
  If a call fails or is slow, that bot falls back to the built-in chat so it never goes silent.
  Limits (in engine.js): at most 8 AI calls at once and about 90 per meeting, so cost stays small.
  Change the model with DEADWEIGHT_MODEL (default claude-haiku-5-5). Needs Node 18+.
  The server prints "Bot AI: ON" at start (and /info shows ai:true). Offline mode (opening index.html
  without the server) has no key, so it always uses the built-in bots.
  Never put the key in index.html or share it.

BOTS
  In the lobby, "Fill empty slots with bots" is on by default. When the host
  starts, bots join until there are 10 players. Bots do tasks, kill, report
  bodies, chat and vote. Untick it to play with humans only (needs 3+).

SPECIAL ROLES (lobby checkbox "Special roles", on by default)
  Each game some crewmates secretly get a special role (each role has a minimum player
  count, e.g. Jester 4, Sheriff 5, Engineer 6; not every role shows up every game).
    JESTER   (neutral) Wins instantly if the group votes them out. Their tasks are
             fake and don't count. If they get killed they just lose. Bait people, but
             don't be too obvious!
    SHERIFF  (crew) Press Q to shoot the nearest player (30s cooldown). Hit an impostor
             and they die; shoot anyone else and the Sheriff dies instead.
    ENGINEER (crew) Press V near a vent: 3 uses, 15 seconds each. Crewmates who see you
             pop out will think you're the impostor, so explain yourself in the meeting.
  Bots play these roles too: the Jester baits in chat, the Engineer says "im the
  engineer" when accused of venting, and the Sheriff shoots anyone it saw use a vent
  (it can shoot the Engineer by mistake and die).
  NEW NEUTRAL ROLES: the Executioner's target is shown in the role badge ("Executioner -> Nova").
  The Survivor also wins when the impostors or the crew win, as long as they are alive. Solo wins
  (Jester, Executioner, Vulture) end the game immediately for that player only.
  Ejecting a neutral player shows their role in the meeting result, like the Jester always did.
  The game-over screen shows everyone's role. Turn the checkbox off for plain
  crew vs impostor.

VENTS (impostors, and the Engineer)
  12 vents in 5 linked networks, like the Skeld:
    Weapons - Navigation - Shields      Cafeteria - Admin
    Medbay - Electrical - Security      Upper Engine - Reactor
    Lower Engine - Reactor
  Walk up to a vent (grate on the floor) and press V to climb in. While inside, you
  can't move or kill; press 1/2/3 (or click the buttons) to travel to a linked vent,
  and V / E to climb out. Crew can see the vent grates. If a crewmate is watching when
  you climb in or out, they see you pop out of the vent, and bot crew will remember it
  and loudly accuse you in the meeting. Everyone is pulled out of the vents when a
  meeting starts. Impostor bots use vents too (to escape after a kill, or to travel).

MAP
  The ship is a copy of The Skeld layout (14 rooms, 28 task stations). Rooms are
  polygons defined at the top of server.js (ROOMS / HALLS / BLOCKS / STATIONS).

CONTROLS
  Move: WASD / arrows (or hold mouse / finger)    Use: E or Space
  Kill (impostor): Q     Vent (impostor): V     Report body: R     Map: M
  Role ability (Medic, Detective, Tracker, Trapper, Paramedic, Bodyguard, Pilot, Phantom, Morphling,
  Saboteur, Silencer, Survivor, Vulture, Cleaner): F

TESTING ALONE
  Just start a room alone: bots will fill the rest.
