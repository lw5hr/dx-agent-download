# DX Agent — User Guide

*Created by Diego – LW5HR, with **Javi – LU5FF** (QA Product Advocate). Thanks to Franco – LU2PWY, Juan Pablo – LU9HVR, Gustavo – LU7HW and Daniel – LU1HLH for trying the first versions. MIT License. Thanks to Pancho – LU4DCW, Javi – LU5FF and Enrique – CP6UA for their support. Support DX Agent: [Ko-fi](https://ko-fi.com/lw5hr) · [PayPal](https://paypal.me/diegodimunzio1) · also with crypto, [Cafecito](https://cafecito.app/lw5hr) · by card or bank transfer, [Wise](https://wise.com/pay/me/diegod2572).
Versión en español: [DOCUMENTACION.md](DOCUMENTACION.md).*

DX Agent watches the DX cluster and the Reverse Beacon Network (RBN), checks every
spotted station against your ADIF log, and alerts you when one you still need is on
the air. It runs on your PC with a dashboard in your browser, and needs only Python
3.11 or newer — nothing else to install.

It answers three questions in real time:

- **Is this station missing from my log?** A new country (ATNO), a new band, a new
  mode, or a call on your watchlist.
- **Is this an active DXpedition, and do I actually need it?** It tracks the NG3K,
  425 DX News and Club Log DXpedition lists and tells you whether working it adds something new, gets you
  a missing confirmation, or adds nothing.
- **Will I get a confirmation?** It shows whether the station uploads to LoTW, and
  can download your own LoTW confirmations.

Contents:

1. [Quick start](#1-quick-start)
2. [Web dashboard](#2-web-dashboard)
3. [Settings page](#3-settings-page)
4. [Commands](#4-commands)
5. [Reading the alerts](#5-reading-the-alerts)
6. [The configuration file](#6-the-configuration-file)
7. [LoTW integration](#7-lotw-integration)
8. [How it works](#8-how-it-works)
9. [Project files and data cache](#9-project-files-and-data-cache)
10. [Known limitations and troubleshooting](#10-known-limitations-and-troubleshooting)

---

## 1. Quick start

**Easiest:** unzip `dx-agent-<version>-windows.zip` anywhere and double-click
**start-dx-agent.bat**. That zip already includes Python, so there is nothing to
install. DX Agent runs without a window (and asks Windows not to put it in "efficiency mode", which with DX Agent waiting for spots in the background made it 3 to 4 times slower: the Log view with a big log, a sort or deleting a QSO took seconds): the dashboard opens in your browser,
**Stop** (top right of the dashboard) closes it, and double-clicking again while it
runs just opens the dashboard. Starting a new version while an older one is still running
stops the old one first (as its Stop button would) and starts the new one. If it can't start, a Windows message says why; what it
prints goes to `data/dx-agent.log` in your DX Agent folder (see below), and **start-dx-agent-console.bat** runs it in a
window to watch it. (The source zip, `dx-agent-<version>-source.zip`, needs
[Python 3.11+](https://www.python.org/downloads/) installed with "Add python.exe to
PATH"; without it, start-dx-agent.bat says so and offers to install it with winget.)

Windows marks what comes from the internet and then warns the first time such a program runs.
**Before unzipping**, right-click the `.zip` > **Properties** > tick **Unblock** (or
`Unblock-File .\dx-agent-<version>-windows.zip` in PowerShell): unzipped from an unblocked zip,
nothing warns, now or on later starts. Once installed, DX Agent updates itself — those downloads
never come from a browser, so there is nothing to unblock again.

Windows draws every `.bat` with cmd's own icon. **create-shortcut.bat** (double-click it once)
makes `DX Agent.lnk` beside it: the same launcher, with DX Agent's logo
(`dxagent/static/logo.ico`). Double-click the `.lnk` from then on; run it again after moving
the folder (the shortcut holds absolute paths).

**On Linux:** unzip `dx-agent-<version>-linux-x86_64.tar.gz` (it includes Python too) and run
its own launcher. It needs glibc 2.17 or newer, that is, any ordinary 64-bit distribution:

```sh
tar -xzf dx-agent-<version>-linux-x86_64.tar.gz
cd dx-agent
./start-dx-agent.sh
```

Everything works there except the Windows programs; see
[Known limitations](#known-limitations). With your own Python 3.11+ instead of the package,
use the source zip and `python3 -m dxagent run`.

**On a Mac:** unpack `dx-agent-<version>-macos.tar.gz` (double-click it in Finder; it includes
Python for Apple Silicon and for Intel Macs) and double-click **start-dx-agent.command** in the
`dx-agent` folder. Terminal opens for a moment and the dashboard opens in your browser. The
package isn't signed by Apple, so the first time macOS refuses to open it: open **System
Settings > Privacy & Security**, click **Open Anyway** next to the message about
start-dx-agent.command, and confirm (on macOS 14 and older, right-click the file > **Open**
works too). From then on a double-click is enough. Or, in Terminal:

```sh
cd ~/Downloads/dx-agent
xattr -dr com.apple.quarantine .
./start-dx-agent.command
```

On a Mac, too, everything works except the Windows programs ([Known limitations](#known-limitations)).

**Your settings and data** are kept outside the program's folder, in a folder of your own that
every version uses. They are `config.toml` and the `data` folder, which holds your alert
history, the saved LoTW password, and the log if you started from scratch:

| System | Folder |
|---|---|
| Windows | `%APPDATA%\DX Agent` |
| Mac | `~/Library/Application Support/DX Agent` |
| Linux | `~/.config/dx-agent` (or `$XDG_CONFIG_HOME/dx-agent`) |

To update, unzip the new version anywhere and start it; the old folder can be deleted. An
installed package mostly updates itself: when the release brings the package for this system and
its `SHA256SUMS`, DX Agent downloads it every hour it checks, verifies it, and replaces its own
files (never `data/` or `config.toml`), then starts again (see **Updates**, below).
**Settings** shows the exact path of `config.toml`. Up to 0.4.x they were kept in the
program's folder: the first time a newer version starts, it copies the settings and data from
there, or from the older version next to it (for example `dx-agent-0.4.3-windows\dx-agent`), and
says so on the dashboard. The older version is left as it was. When there is none, the first
start creates `config.toml` from `config.example.toml`; then set your callsign and log in
**Settings**. To use another `config.toml`: `python -m dxagent -c path/config.toml run` (its data
goes in `data`, next to it), or the `DXAGENT_HOME` environment variable with another folder.

From a terminal instead:

1. Open a terminal. In VS Code: **Terminal → New Terminal**.
2. Go to the project folder:

   ```powershell
   cd C:\path\to\dx-agent
   ```

3. Start it:

   ```powershell
   python -m dxagent run
   ```

   Your browser opens the dashboard at **http://localhost:8073**.
4. The first time, click **Settings** (top right) and check your callsign, the path
   to your ADIF log and, if you want, your LoTW password. **Save and apply**.
5. Press **Ctrl+C** in the terminal to stop (it prints `73!`).

It uses the `config.toml` in your DX Agent folder (above), wherever you run it from. To use
another one, pass its path (its data goes in `data` beside it):

```powershell
python -m dxagent -c C:\path\to\config.toml run
```

On Linux the commands are the same with `python3` and `/path/to/dx-agent`.

A normal start looks like this in the terminal, followed by one line per needed
station:

```text
[log] 23817 QSOs, 271 DXCC entities (248 confirmed) from N0CALL_20261013_175723_backup.adi (1.6s)
[lotw] no LoTW password set - using confirmations from the ADIF log only
[dxped] NG3K 69, 425 DX News 71, Club Log 3 -> 106 DXpeditions
[dxped] 36 active now
[agent] alerting on: atno, dxpedition, new_band, new_mode, watchlist | bands: 160m ... 6m | modes: CW PHONE DIGI
[ui] dashboard at http://localhost:8073
[rbn-cw] connected to telnet.reversebeacon.net:7000
[rbn-ft8] connected to telnet.reversebeacon.net:7001
[cluster] connected to w3lpl.net:7373
[cluster] logged in as N0CALL
```

Every 10 minutes it prints a status line with the number of spots processed and
alerts raised.

**Pop-ups:** alerts also appear as Windows notifications (Windows 10/11), and in a Mac's
Notification Center, with nothing extra to install. On Windows, clicking one opens the
dashboard at that station (its grid, its row in view). On Linux they need `plyer`
(`pip install plyer`); without it the alerts still appear in the dashboard.

**In the dashboard**, the same alerts (and every VHF opening, a 2 m duct and a DXpedition coming on
the air) also show at the top right, one under the other, the newest on top: each stays two
minutes (not while the mouse is on it), until you click it or close it with its ✕; with two or
more, **Close all**. A click takes you there: the alert's row in the list (it flashes) with its
station's panel open, the map for a duct. One for a station you work or take out of the list goes.

---

## 2. Web dashboard

`run` starts the dashboard and opens it in your browser at **http://localhost:8073**.
The console keeps working as before; the dashboard is another view of the same agent
and closes when you stop `run`.

```powershell
python -m dxagent run               # console + dashboard, opens the browser
python -m dxagent run --no-browser  # dashboard running, but don't open a tab
python -m dxagent run --no-ui       # console only
```

### What's on the screen

| Area | What it shows |
|------|---------------|
| **Header** | Your call; one pill per feed (green = online, amber = connecting, red = down) with its spot count (hover for the server and last spot time; a click leaves in the list and the map only the stations it heard, see Filters); a **DXpeditions** pill next to them: how many are within their dates and how many of them were spotted in the last 15 minutes ("48 · 6 on the air", its dot green while one is; a click opens the DXpeditions tab); a **propagation** pill at their side: SFI, SN, A and K, the field's state in its dot, and the storm's level when there is one (**G2** red while it lasts, softer when it is only today's forecast; **R1** for a radio blackout; grey dashes when NOAA SWPC has nothing fresh), its tip saying how old each value is, what A and K mean and the G/R/S scales; your log totals; icon buttons (hover for what each does): **About** ⓘ (what DX Agent is, who made it, the collaborators, how to support it, and help: the website, the user manual and the issues page), **Settings** ⚙ (on the Settings page, a list icon back to the alerts), **EN/ES/PT** (language), **Theme** (half circle = Auto, sun = Light, moon = Dark, a palette = another theme; a click opens the menu of themes), **Browser sound** (speaker, crossed out when off), **Full screen** (four corners; the **F** key too, F or Esc to leave) and **Stop** (red); UTC clock. `#about` opens the About window. On a narrower window (up to 1800 px) the pills go below your call and the buttons, the whole width; the chevron after them folds them to their status dots, in one highlighted pill next to your call (a click on it opens them again; remembered in the browser) |
| **Filters** | Three rows, a line between them: alert type (with **List** / **Map** and **Clear list**); band, mode and the others; continent and a search box for call or country (the country in English or in the dashboard's language, accents or not: **United States**, **Estados Unidos**). **Continent** (AF, AN, AS, EU, NA, OC, SA) leaves the stations from the continents picked, to keep to where your antenna points; your own call spotted always shows. Only the alert types, bands and modes you alert on in Settings get a chip; the ⚙ next to Clear filters (or Settings → Filters above the list) picks which of Continent, Near you only, Hide confirmed, Only LoTW and Activity show, a hidden one turned off. The ⚙ at the end of the alert types (or Settings → Alert types above the list) does the same for them: a type hidden there still alerts, only its filter goes. Each option says how many stations it would show, with the other filters as they are (with 20 m picked, the modes say how many on 20 m; a station on several bands is one). No chip selected = show everything. An alert counts for each of its reasons, so a DXpedition on your watchlist shows under both **DXPED NEED** and **WATCHLIST**; **WATCHLIST** also lists your watchlist calls' spots that made no alert (grey **SPOT** rows), so you see when they are on the air. Several types picked show any of them, except **WATCHLIST**: with another type, only your watchlist calls that are also that type (**WATCHLIST** + **NEW SLOT**: the calls you follow on a band and mode you still need; their SPOT rows by what they add). SPOT rows are one per station, band and mode: the latest spot, with **×N** for how many (a CQ is heard by several RBN skimmers at once; hover for who heard it); those before an alert of the same station, band and mode are that alert's. A SPOT row that still adds to your log (it made no alert of its own because the same alert isn't repeated within the cooldown) is coloured like what it adds, not grey. **Hide confirmed** leaves out stations whose entity you already have confirmed on that band and mode (an alert for a new call, a SPOT row): only what adds to your log stays. **Only LoTW** leaves the stations that uploaded to LoTW in the last 12 months and the DXpeditions that announced LoTW: the ones likely to confirm there. A click on a feed's pill in the header (Cluster, RBN CW, RBN FT8, PSKReporter, WSJT-X) leaves the rows it spotted (the list's are alerts, what adds to your log: far fewer than the spots the pill counts) and the stations it heard on that band in the last 15 minutes, whoever spotted them first (WSJT-X: those your own WSJT-X or JTDX decoded, heard where you are); the pill is highlighted and the folded filters say it, another click or **Clear filters** shows every feed again. Your filters are remembered in the browser. **Clear list** (after confirming) empties the alert list, in every open dashboard and after a reload, and starts the cooldown again: whatever is still on the air alerts again at its next spot. The alert history (`data/dxagent.db`) and the Station tab's latest spots are kept. One station only: the **✕** next to its call (it shows with the mouse on the row), or a right click on the row → **Remove from the list**, takes that station on that band out of the list (and off the radio's panadapter) in every open dashboard; its cooldown goes on, so it alerts again once that is over. The **anchor** next to the ✕ (**Pin to the list**) keeps that station on that band in the list however long ago it was spotted (neither **Take out of the list after**, nor a full list, nor **Clear list**, nor restarting DX Agent takes it out), on top whatever the order, highlighted with its anchor always in sight, and on the radio's panadapter; it stays pinned until you take it out with its ✕, work it on that band (your log says so) or click its anchor again. In every open dashboard. The chevron next to **List** / **Map** folds the filters to one line that says what is picked ("FILTERS 20m · CW", highlighted while a filter is on); the search, Clear filters, the count and Clear list stay. Folded or not, it is remembered in the browser |
| **Alert table** | One row per alert, newest on top, coloured by type: UTC, alert, call, kHz, band, mode, country, what you need, LoTW, **VOACAP** (the chance of a QSO this hour, see The prediction: VOACAP), **near you** (see below), who heard it. Click a column header to sort by it (kHz, band, mode grouped CW / phone / digital, country...; **Alert** and **What you need** put the most wanted first, **LoTW** the latest uploads first); click again for the other way round, a third time for newest first again. The arrow shows the order; rows with nothing in that column go last, ties stay newest first, new alerts slot into place, and the order is remembered in the browser. New rows flash. A newer spot of the station on the same band and mode (one the cooldown kept from alerting again) updates its row: time, frequency, mode, who heard it (×N) — so the row shows where the station is now, and the Tune button goes there. Rows fade 10 minutes after the station's last spot and fade more after 30 (hover a row for its age and the alert's own time); with **Take out of the list after** set in Settings, they leave the list after that many minutes |
| **Station tab** | Click any alert, or type a call in the box, to see that country's band × mode grid (green C = confirmed, amber W = worked, grey = not worked; a green ring marks the bands and modes where the station was spotted in the last 15 minutes, the latest one blinking, and a dot sits over the band), under it, where you worked this exact call (a row per mode as you logged it, FT8, FT4, SSB..., in the same columns: ✓ green confirmed, ✓ amber worked, NEW a band and mode still new for the country), LoTW status, DXpedition details, who hears it nearest you, a **Check PSKReporter** button (or, live, the receivers reporting it as they arrive), **Show only** this call, **☆ watchlist** and **Spot it** buttons, its latest spots, and links to QRZ.com, HamQTH and DXWatch. The chevron right of the tabs folds the panel to a strip of their icons (a radio, the globe, a summit, a trophy), with the DXpeditions on the air and the Marathon score still showing; a click on an icon opens it at that tab (below the list on a narrow screen: only the row of tabs). While it is folded, hovering over a row of the list shows that station's card: its country, status and band × mode grid. Folded or not, it is remembered in the browser |
| **Ventanas tab** | When each country you still need is heard from near you: one row per country, with its Most Wanted rank and 24 hours as a line of bars. Order by **A–Z**, **Most Wanted** or **This hour**. Click one for every band and mode, hour by hour, with who heard it and how far, the empty hours filled with VOACAP. **Needed** / **All** (see Ventanas) |
| **DXpeditions tab** | Active DXpeditions and those starting in the next 30 days. Badge: **ATNO**, **Not confirmed**, or how many bands you have (e.g. "1 of 10 bands", highlighted when fewer than half). Tick **only needed** to hide ones you already have on most bands. Sorted by what's **on the air** (spotted in the last 15 minutes, the latest on top), by Club Log's **Most Wanted** rank (most wanted country first) or by start date: **Order** at the top. Each card shows its sources and Club Log's **Most Wanted** rank; one spotted in the last 15 minutes is framed in green as **ON THE AIR**. Click one to open its grid; the **☆** adds it to your watchlist |

**Which station was it?** Hover over a **C** or **W** cell of the Station tab's grid and a
card lists the QSOs that made it — call, date, mode, and a **✓** when confirmed — newest
first, up to eight (then "+N more"): the fastest way to tell whether the 20 m QSO with São Tomé
was the current DXpedition or another station years ago. The cell keeps showing that and, when
the station is on the air, its latest spot.

**On the air, in the Station tab's grid.** The band × mode grid also shows where the station
is transmitting now:

- **Green ring** on each band and mode where it was spotted (cluster or RBN) in the last 15
  minutes, and a **dot ●** over that band. The ring is set apart from the cell, so it shows
  on a confirmed **C**, a worked **W** or an empty cell alike; on an empty one, it's on the
  air on a band you still need.
- **Blinking:** only the cell of the **latest spot**, where the station is now. The others
  keep a steady ring. When a spot comes in on another band, the blinking moves there.
- **On several bands at once** (a DXpedition with several stations, S9R say): every band
  spotted in the last 15 minutes has its ring, and the latest one blinks.
- **Hover** a ringed cell: when it was spotted, on what frequency and mode, and by whom.
- **Click** a ringed cell (with a radio set up, see Tune the radio): Tune goes to that band
  and mode's latest spot, and the Tune button keeps it.
- A spot that doesn't say its mode marks the whole band. With no spot for 15 minutes, the
  ring and the dot go. With Windows' animations off, the latest one has a thicker ring
  instead of blinking.

**Band colours.** Each HF band and 6 m has its own colour, used for the band tag in
the table, the band filter chips, the station grid and the Settings page: 160 amber,
80 violet, 60 red, 40 blue, 30 olive, 20 pink, 17 green, 15 teal, 12 brown, 10 purple,
6 orange (4 m, 2 m and 70 cm share grey). The order was checked with a colour-blindness
simulator so that neighbouring bands stay distinct, and the band name is always shown
in the tag, so colour is never the only cue.

**Mode colours.** The mode tag in the table (and in a station's spots) takes its group's
colour: CW blue, phone (SSB, AM, FM) amber, digital (FT8, FT4, RTTY...) pink; the mode
filter chips too. A mode DX Agent guessed has a dashed border, an unknown one is grey.

**EN/ES/PT** switches the dashboard between English, Spanish and Portuguese (Brazil): each
click goes to the next one. The first time it follows your browser's language; after that
it remembers your choice. A link can force one: `http://localhost:8073/?lang=es` (or
`?lang=pt`). In Portuguese, the About window's website and manual links open the English
ones. Country names and DXpedition notes stay in
English, as they come from their sources; the terminal and the alerts kept in
`data/dxagent.db` are always in English.

**Theme** opens a menu of themes, each with a preview of its colours: **Auto** (follows Windows
light/dark mode), **Light**, **Dark**, **High contrast** (white on black) and **High contrast
light** (black on white), **Solarized dark** and **light**, **Nord**, **Dracula** and **Dracula
orange** (the same, its accent in the palette's orange), **Alucard** (Dracula's light pair) and
**Alucard black** (that palette on its dark grey) and **Sepia** (warm paper tones). A click
switches to it and the menu stays open to try another; a click outside it or Esc closes it. The
skins change the background, panels, text and accent and the map's sea and land; the band and mode
colours stay those of the light or dark theme, chosen to be told apart by colour-blind viewers
too. The Dracula and Alucard skins also bring their own alert, state and grid colours (from the
[Dracula spec](https://draculatheme.com/spec)), with their greys lightened where the spec's would
fall under a readable contrast. Your choice is remembered in the browser. A link can force one:
`http://localhost:8073/?theme=light` (or `dark`, `hc`, `hcl`, `sol-dark`, `sol-light`, `nord`,
`dracula`, `dracula-orange`, `alucard`, `alucard-black`, `sepia`).

**Browser sound** beeps in the browser tab for ATNO and priority-2 alerts. It is off
by default; the agent itself makes no sound.

**Links you can bookmark:** `http://localhost:8073/#settings` opens Settings,
`#call=VP8PJ` opens that station, `#dxped` opens the DXpeditions tab.

**When something is wrong** — for example the log file can't be found — the agent
keeps the dashboard running and shows a yellow banner with the reason and a link to
Settings, so you can fix it without the terminal.

### Tune the radio

With a radio target set (Settings → **Radio (Tune button)**), clicking an alert's
frequency asks your logger or rig-control program to move the radio there, and opens the
station on the right, as clicking the row does. A **Tune** button also appears in the
console, after the radios: for the row you clicked in the list (highlighted more strongly
than the call's other rows), or else the station's latest spot. One button sits beside the
radios when it fits; a button per slice or radio goes on a line of its own under them (the
console grows taller, the list or the map gives it the room). With DX Agent's logbook off
there is no console, and the button is in the Station tab. A message in the top-right corner
says whether it worked.

**Transmit protection:** DX Agent checks for receive (PTT off) before its own Tune, band and VFO
changes. It refuses to move the radio while TX is reported or when the state cannot be verified.
For TCI the last Tune may instead be held until RX is confirmed. An old `tci_tx_guard = "off"`
is treated as `block`; it no longer disables the check. Through flrig, tuning is off unless
`rig.flrig_tx_guard = "ptt"` (see below): reading the radio works either way.

**This is not an absolute interlock.** Reading PTT and executing a command are separate operations:
TX can start in between, and the reported PTT can be delayed or wrong. DX Agent cannot stop the
radio's own controls or another application (including clicks on AetherSDR's panadapter) from
changing frequency. Verify the PTT indication for your actual setup under safe conditions. If a
change during TX must be impossible, use a physical interlock or equipment with an atomic,
hardware-enforced TX lock.

| Target | How DX Agent talks to it | Default port | Mode too? |
|--------|--------------------------|--------------|-----------|
| Log4OM 2 | Frequency and mode through OmniRig; UDP `SetCallsign` for Log4OM | 2241 | yes, through OmniRig |
| N1MM Logger+ | UDP `radio_setfrequency` (kHz); Tune only while the `RadioInfo` it broadcasts (every 10 s) says the program receives | 13064 | no |
| DXLog.net | The same N1MM message and `RadioInfo` (Options → Broadcast, N1MM format) | 13064 | no |
| OmniRig | Windows COM, through PowerShell; Rig 1 or Rig 2 | — | yes |
| Hamlib rigctld | TCP `F <Hz>` / `M <mode> -1` (split: `S 1 VFOB`, `I <Hz>` and `V VFOA`; ended: `S 0 VFOA`); reads the current VFO, PTT and S-meter; requires uncached PTT | 4532 | yes |
| flrig | XML-RPC `rig.set_frequency` / `set_mode` / `set_AB` (split: `set_vfoA`, `set_vfoB`, `set_split`), and `get_vfo` / `get_vfoA` / `get_vfoB` / `get_AB` / `get_mode` / `get_split` to read it; Tuning and VFO switches only with `rig.flrig_tx_guard = "ptt"`, each command after asking flrig for the radio's PTT (it cannot say whether its PTT input is configured) | 12345 | yes |
| DXLab Commander | Tuning blocked: no verifiable PTT on this connection | 52002 | — |
| TCI (AetherSDR, ExpertSDR, Thetis) | WebSocket `vfo` / `modulation`, on a connection DX Agent keeps open; it also puts the alerts on the panadapter | 50001 | yes |

Hamlib can read frequency, mode, PTT, split and the S-meter, and DX Agent can start `rigctld`.
OmniRig needs Windows and the radio's file; flrig, its XML-RPC server on its control port (no
`rigctld` needed); TCI, a supported server. Blocking Tune through DXLab Commander does not
disable receiving QSOs from it.

- **N1MM Logger+ and DXLog.net (`RadioInfo`):** both broadcast a `RadioInfo` message with the radio
  they have, its frequency and mode, and `IsTransmitting`. DX Agent tunes them over UDP and sends
  nothing unless a fresh `RadioInfo` (30 s) says the program is receiving; nothing fresh — the
  program closed, or not broadcasting to DX Agent's port — is unknown, and a Tune is refused. Point
  their broadcast at DX Agent's UDP port (Settings → Logbook → UDP port, 12065 by default; N1MM:
  Config → Broadcast Data). **Their own note:** `IsTransmitting` is True only when the program
  started the transmission; keyed from outside it (a foot switch, a paddle) it still says False.
  The frequency goes; the mode is the radio's, set in the program.

- **flrig (`rig.flrig_tx_guard`):** flrig reads the radio's frequency, mode, split and both VFOs
  from the start. Tuning through it is off by default (`"block"`): flrig cannot say whether it is
  configured to read the radio's PTT, and with no PTT input it can report RX while the radio
  transmits. Set it to `"ptt"` (Settings → Radio, shown when a radio is on flrig) if flrig has its
  PTT input on — PTT by CAT or by the serial port, the same it needs for WSJT-X: then each command
  goes only after flrig says the radio receives, a Tune during TX is refused, the Log tab's VFO A/B
  can be switched where flrig does it (checked with `rig.get_AB`: an Icom takes `set_AB` and stays
  put, and DX Agent says so), and the PTT the panel shows is flrig's (with `"block"` it says
  **PTT?**: unknown). Without it, use
  Hamlib or OmniRig for Tune and leave flrig to read the radio; both cannot own the serial port at
  the same time.

- **Mode chosen:** CW for CW spots; USB or LSB for phone (LSB below 10 MHz, except
  60 m); RTTY for RTTY; for FT8/FT4, USB through OmniRig (how WSJT-X runs the radio)
  or the data mode through Hamlib and TCI. Untick **Also set the mode** to
  change only the frequency.
- **A mode that already suits the spot is kept (OmniRig, and Log4OM through it):** for an
  FT8/FT4 spot, a radio in USB or in its data mode only moves frequency; for CW, one in CW or
  CW-R. So a radio that needs its data mode for FT8 (an IC-9100 in USB-D) keeps it from one
  FT8 spot to the next: put it in USB-D once. Phone spots always set USB or LSB, so a data
  mode is never left on with the microphone muted.
- **CW on Icom radios (OmniRig):** OmniRig's Icom files call the radio's CW-R "CW upper" and
  its plain CW "CW lower", so on an Icom DX Agent asks for "CW lower" (tested: IC-9100 in CW,
  not CW-R); on other makes plain CW is "CW upper".
- **Log4OM and the mode:** Log4OM's remote control accepts `SetMode`, but it changes only
  the mode on Log4OM's screen, not the radio's (tested: Log4OM 2.42 with an IC-9100). Log4OM
  drives the radio through OmniRig, so DX Agent always sets frequency through OmniRig and, when
  enabled, the mode too, on the OmniRig rig that is on-line (the **OmniRig radio**
  setting is tried first), and Log4OM follows the radio as usual; the call still goes to
  Log4OM. Without OmniRig, or with no rig on-line, Tune is blocked; it never falls back to UDP.
- **Log4OM:** turn on Settings → Software integration → Connections → **Remote
  control** (port 2241). DX Agent sends the spot's call (`SetCallsign`), so Log4OM's QSO window
  is ready to log it; a call you typed there yourself is left alone (Log4OM's rule).
- **Only from the dashboard:** like saving settings, Tune only works from the
  dashboard page itself, so other websites can't move your radio.
- **Tested:** the current PTT checks against stand-ins and Hamlib's dummy radio. They have not
  been verified against a real radio.

**FlexRadio with AetherSDR (TCI).** AetherSDR, the FlexRadio client, has a TCI server
(as ExpertSDR for SunSDR and Thetis do). In AetherSDR turn on Settings → **Autostart TCI
with AetherSDR**, or **Enable** in its TCI applet (port 50001); in DX Agent, Settings →
Radio → Tune through **TCI**. DX Agent then keeps one connection open (the header shows a
**TCI** pill: green while connected, with the number of spots on the panadapter), and:

- **Tune** moves the slice that transmits (the TX slice) to the spot, or, until DX Agent knows
  which one that is (it asks AetherSDR every 2 s), the one with the focus, and sets the mode (CW, USB/LSB,
  RTTY, DIGU for FT8/FT4); a slice in CW-R keeps it for a CW spot. An FT8 spot always sets DIGU (a
  Flex sends DAX audio in DIGU), even from USB.
- **Not while transmitting** (**While transmitting (TCI)**): AetherSDR tells DX Agent when the
  radio goes on the air and when it stops, so a Tune then (a click on a spot mid-QSO, an FT8
  spot clicked while WSJT-X transmits) doesn't move the radio nor give WSJT-X a new call.
  **Don't tune, and say so** (the default) blocks it; **Tune when the transmission ends** holds
  the last request, rechecks RX and drops it after one minute. Unknown or stale PTT blocks Tune.
  DX Agent never keys the radio: it only reads whether it transmits.
- **Split** (**Split when the spot says so**, on by default): when the station's spots of
  the last 15 minutes on that frequency say where it listens (**UP 5**, **UP5K**, **5 UP**,
  **UP 1-3**: the middle, **DN 2**, **QSX 14.205**, **QSX 205**: the kHz past the MHz), Tune puts
  the radio in split: it listens on the spot's frequency and transmits where the station does,
  and DX Agent says "split: TX 14026.0 kHz". With AetherSDR it opens a second slice that
  transmits there (TCI split); through OmniRig and Hamlib rigctld it sets the radio's own
  split (the station's frequency on VFO B, listening on VFO A: Hamlib can leave a radio
  such as the IC-9100 on B, the one it transmits on). **UP** or **SPLIT** alone goes up by the default for
  the mode (1 kHz on CW and RTTY, 5 on phone, set beside the option). The next Tune to a station
  without split ends it: on TCI it moves the receiving slice and AetherSDR closes the slice it
  opened; on OmniRig and Hamlib the radio's split is turned off, whoever turned it on (DX Agent before
  a restart, WSJT-X, you): the last station's split is no use for the next one.
  Log4OM is not asked to split. To N1MM and DXLog only the frequency goes, DXLab Commander cannot
  tune, and flrig sets it with `rig.flrig_tx_guard = "ptt"`. Not on FT8 and
  FT4 (a DXpedition's Fox/Hound isn't a radio split), nor a split off the band or more than
  50 kHz away.
- **WSJT-X on TCI too:** an FT8 or FT4 spot sent to WSJT-X moves WSJT-X's slice (the one on the
  dial WSJT-X's Status says), not the TX or focused one, so WSJT-X changes band with it: AetherSDR
  tells every program each slice's frequency, but WSJT-X only reads its own slice's. Needs
  WSJT-X's UDP messages reaching DX Agent; without them (or with WSJT-X on the TX slice), as above.
- **With two or more slices open**, the Tune button becomes a button per slice:
  under "Tune 14025.0 kHz CW on slice", its letter and where it is now (**A** 7074.0 DIGU ·
  **B** 14010.0 CW). The TX slice is marked **TX**, and the one the list's and the grid's
  frequencies tune stands out: the TX slice, else the one with the focus (once the focused slice
  is closed, until AetherSDR gives the focus to another: the first one open). Choosing a slice
  here tunes it but doesn't give it the focus in AetherSDR: AetherSDR keeps the focus to itself.
  A slice shows its letter once it has had the focus (AetherSDR only says it then); until then,
  its RX number in AetherSDR's TCI applet (**RX2** = the slice the applet shows on RX2). The
  buttons follow AetherSDR: a slice opened, closed, given the focus or TX shows within a few
  seconds.
- **The alerts go on the panadapter** (**Show the alerts on the radio's panadapter**, on by
  default): each station of the alert list in its colour (ATNO red, new band orange, new
  mode cyan...), with its headline and country. It moves when a newer spot puts it on
  another frequency, and is taken off when it is no longer spotted (after **Take out of the
  list after**, or 15 minutes), when the list is cleared, or when your log says you no
  longer need it: a station you then work (WORKED in the list) leaves the panadapter, or stays in grey with **Leave the stations you then work on the panadapter, in grey**. Your own call's spots are not shown. Every band's alerts go (their number is on the TCI pill; a click on it leaves in the list the alerts on the panadapter), those on the bands the radio's slices are on first, the ones it shows; tune to another band and that band's show. AetherSDR's own DX cluster and RBN
  spots stay as they are: DX Agent only adds, and takes off, its own. Closing DX Agent takes
  them off too; one that ended without doing it (it hung, Windows ended it) wrote down which
  they were (`data/tci-spots.json`), and the next start takes them off first.
- **A click on one of those spots** tunes the radio there (AetherSDR does it), and opens the
  station in DX Agent's Station tab.
- If AetherSDR is closed or restarted, DX Agent connects again by itself and puts the spots
  back. AetherSDR on another computer: its address in **Address**.

**WSJT-X.** Settings → Radio → tick **Also send the call to WSJT-X**, and in WSJT-X tick
Settings → Reporting → **Accept UDP requests**. DX Agent must also receive a recent UDP Status
(within 10 seconds) from every WSJT-X instance, with unique IDs, and confirm RX on every configured
radio; otherwise Configure is blocked. Configure WSJT-X's UDP Server and DX Agent's
`logbook.udp_port`/`udp_group` as in “What your WSJT-X decodes”. Then Tune on an FT8/FT4 spot puts the
radio on the FT8/FT4 dial frequency (14074, not the spot's 14075.6) and fills WSJT-X's
**DX Call** and **DX Grid** (when RBN reported it), sets FT8 or FT4 and moves the Rx
frequency to the station's audio offset (1600 Hz for 14075.6), then generates the
standard messages: you click **Enable Tx**. A supported, verifiable radio control is required.
DX Agent finds WSJT-X by itself for sending and doesn't
take over WSJT-X's UDP port 2237, so Log4OM, JTAlert or GridTracker keep working.

**Hamlib.** DX Agent talks to Hamlib's `rigctld`, which must be running: start it with your
radio's model, its COM port and speed, for example for an IC-9100 on COM7

```
& "C:\Program Files\hamlib-w64-4.5.4\bin\rigctld.exe" -m 3068 -r COM7 -s 19200 -C cache_timeout=0
```

(that is PowerShell: `&` before the path in quotes; in `cmd`, without it). `rigctl -l` lists
the models. A second radio: its own `rigctld`, with `-t 4533`, and that port in DX Agent. A COM
port takes one program at a time, so that radio can't be on OmniRig as well. DX Agent tunes
through it and reads it back for the console under the list, with its S-meter.

The radio/backend must actually report the physical PTT, and `dump_caps` must report `Can get
PTT: Y`. DX Agent checks `\get_cache` is zero before each change; old rigctld versions that do
not support it, enabled caches, and the Hamlib FLRig and NET rigctl proxy backends are blocked.
Capability flags alone do not prove that PTT is wired and configured correctly.

**DX Agent can run rigctld itself:** tick **Start rigctld with DX Agent** in that radio's
settings and put what you would type after `rigctld` in **rigctld arguments** (`-m 3068 -r COM7
-s 19200`), plus its **program** if it isn't in PATH. Then there's no console to open: DX Agent
starts it when it starts, adds `-t` with the radio's port and `-C cache_timeout=0` unless you set a
`cache_timeout` yourself (the PTT read from the radio, which a Tune checks first), sends its output to DX Agent's log,
and closes it when DX Agent closes (only its own: a `rigctld` you started yourself is never
touched).

**One rigctld per radio, always.** DX Agent keeps a note of the one it started
(`data/rigctld-<n>.json`, its process id and what it was run with), so:

- **Closed with DX Agent**: it is asked to close first (so it lets go of the radio), then ended,
  whether you stop it from the dashboard, close it, or it ends on an error.
- **Not started twice**: if DX Agent was killed — Task Manager, a power cut — the `rigctld` it
  started can stay up. The next start finds it by that note and **uses it** instead of starting
  another one, and closes it when it ends.
- **An orphan that isn't answering** (its radio was busy when it started) is closed before a new
  one is started, so the COM port isn't left taken.
- Something already answering on that port with no note of DX Agent's is **someone else's**: your
  own `rigctld`, the other radio's, or another DX Agent's (two copies on one folder) — it is used
  and left alone.

If it ends by itself it's started again, each time a little later; if the program isn't there it
says so and waits (Settings → Radio to fix the path). Each of the two radios can run its own, on
its own port.

**Two radios.** Settings → Radio has a **Radio 2** under **Radio 1**, each with its own
program, address and name (empty: as OmniRig or the TCI program names it, IC-7300,
AetherSDR); **Both radios** holds what is common (WSJT-X, split, and the panadapter and
"while transmitting" options, which only show with a radio on TCI). For
example a Flex on AetherSDR (TCI) and an IC-7300 on OmniRig, or OmniRig's Rig 1 and Rig 2.
Only one of the two can be on TCI, and two on OmniRig must be its Rig 1 and Rig 2.

- **The active radio** is the one you last tuned or transmitted on; a click on the other one
  in the console's radio box makes it the active one. The QSO form follows it, and the alert
  list's frequencies tune it.
- **Tune**, after the radios in the console, has a button for each radio (each slice of the one
  on AetherSDR), with where it is now; the active one stands out.
- **The console's radio strip**, along its top, shows both side by side, each with its name before
  its VFOs or slices, a line between them; the active one's name in the accent colour.
- **N1MM or DXLog.net (SO2R):** Tune is blocked because PTT cannot be verified.

### Follow one station

In the Station tab (click an alert, or a DXpedition in the DXpeditions tab):

- **Show only VP8PJ** limits the list and the map to that call. The list also shows its
  spots that made no alert (grey **SPOT** rows, e.g. a band you already have), so a
  DXpedition on the air never shows an empty list. A **Only VP8PJ ✕** chip
  appears above the list; click it (or **Show all calls**, or **Clear filters**) to see
  every call again. This filter is not saved, so a reload shows everything.
- **☆ Add to watchlist / ★ Remove from watchlist** adds the call to your watchlist or
  takes it off. It's saved in `config.toml` and takes effect at once, without a restart.
  A call covered by a wildcard such as `VP8*` shows **★ In the watchlist (VP8*)**;
  wildcards are edited on the Settings page. The DXpeditions tab has the same star on
  each card.
- **Spot it** posts a DX spot of the station on the DX cluster DX Agent is logged in to
  (Settings → Spot sources), as your callsign: `DX 14025.0 3Y0K up 2`. It opens a small form
  with the frequency of its latest spot (you can change it) and a comment (at most 30 plain
  characters, no accents: what DXSpider and AR-Cluster keep); after you confirm, the spot
  goes out: **posted** when the cluster sends it back to you (most do), **sent** when it doesn't
  (W3LPL, for one: check it on DXSummit), and an error with what the cluster answered when it
  refuses it within 5 seconds (some nodes only take spots from registered users). Every station connected to that cluster sees
  it, and it goes on to the other clusters: spotting yourself is frowned upon, and DX Agent
  asks again if you try. At most one spot every 30 seconds. With the cluster off or down the
  button is greyed out; the RBN only receives.
- **Latest spots** lists the call's spots from the last 60 minutes, from the cluster
  and RBN, including ones that didn't make an alert (for example a band you already
  have). It's kept for DXpeditions, watchlist calls and calls that alerted, from the
  moment the agent started. With radio control on, click a frequency to tune to it.
- **The icons at the right** of the tab, one per section (beam heading, bands and modes,
  grid square and path, VOACAP, latest spots, who hears it, and the Marathon, the park, summit or
  island and the DXpedition when the station has them): a click hides that section, another shows it again,
  for every station. A hidden one's icon is dimmed; the browser remembers which.

### Activations: POTA, SOTA, IOTA...

The **Activity** menu (after the mode chips) shows only activations: **POTA, SOTA, IOTA,
WWFF, BOTA, COTA (WCA castles), LOTA (lighthouses), TOTA, ROTA, JOTA, YOTA** and **EME**, or
*any activation* (*none*, the first option, is no Activity filter: everything shows). Next to each, how many stations are on it in the last hour.

- The list shows their alerts and also their spots that made no alert (grey **SPOT**
  rows: a park in a country you already have still shows), from the last hour.
- Each row says the activation under *What you need*, with its reference: `POTA US-5584`,
  `IOTA EU-038`, `WWFF KFF-6494`...
- **The References tab** (it shows while an Activity is picked in the menu, and opens on that program): every summit, park, island and castle you worked (POTA, SOTA, WWFF,
  IOTA, WCA), program by program: how many worked, confirmed and confirmed by QSL, and each one
  with its name and place (POTA's and SOTA's lists), the bands you worked it on, **C** confirmed /
  **W** worked, and your latest QSO with it. Search, and show all, confirmed, by QSL (a paper QSL)
  or not confirmed; click a row for your QSOs with it (**✓** confirmed in LoTW, **✓ QSL** by a
  card), and a POTA or SOTA row for its card too. From your log (QSOs that say the reference: POTA_REF, SOTA_REF,
  WWFF_REF, IOTA, SIG_INFO, Log4OM's award references) and your QSOs with activators DX Agent saw
  on the air. *Confirmed* means a QSO with it is confirmed in LoTW or by QSL; each program's own
  credit is on its site (pota.app, sotadata, wwff.co, iota-world.org). **IOTA** credits an island
  by QSL card, or through LoTW when the LoTW confirmation says the island (the station put it in
  its LoTW location) or the country is a single island group, so not every island confirmed here
  counts there: upload your log at iota-world.org to see the ones it matches. **By QSL** shows
  those with a paper QSL (`QSL_RCVD` in your log; in a log downloaded from LoTW it is LoTW's own
  confirmation, so it doesn't count as a card). POTA's parks list
  (`data/pota-parks.csv`, ~10 MB) is downloaded again when a month old.
- **Your parks and summits on the map:** the **References** menu next to DXCC / WAZ shows the
  POTA parks and/or SOTA summits you worked, green confirmed, amber worked. Click one to see it in
  the Station tab: its pota.app or SOTA card and your QSOs with it (click one to open that
  station), and on the map the path, beam heading and distance from your QTH.
- **The park or summit in the Station tab (POTA, SOTA):** click the row and a card shows what
  pota.app or SOTA say about it: its name, type and where it is (grid square), whether **you**
  worked it and on which bands (or "New for you"), how many activations and QSOs it has, who
  activated it first, its latest activations (call, date, QSOs by mode) and links to its page
  on pota.app or SOTA and to the park's own website. Asked from api.pota.app and
  api2.sota.org.uk (public, no login) when you open it, and kept 30 minutes. A WWFF, IOTA or
  COTA reference gets a smaller card, with what the spot says: its name, and whether you have
  it on that band.
- **POTA and WWFF:** DX Agent also reads their own lists of who is activating now (pota.app
  and wwff.co, every 2 minutes). Any spot of those stations gets its park, even an RBN FT8
  spot (RBN drops the "POTA" of "CQ POTA"), and activators spotted only on those sites show
  too ("(POTA)" in *Heard by*). SOTA's list of who is on the air needs registration with
  SOTA and approval, so SOTA is found from comments only.
- **SOTA summits:** DX Agent keeps SOTA's list of summits (storage.sota.org.uk, fetched again
  when a month old). A summit reference must be a valid summit to count, unless the spotter
  wrote "SOTA" before it (a summit newer than our copy). Hover over the activation to see the
  summit's name, altitude and points; POTA and WWFF parks show their name there too.
- **On the map:** activations sit at their summit (a mountain with a jagged peak) or park (a pine tree), from SOTA's
  list and POTA's and WWFF's; coloured by where you stand with that reference, as the DXCC and
  References layers: red not worked, amber worked, green confirmed (hover for which). Drawn so
  only with an Activity picked: with "none", a station in a park or on a summit is a dot like
  the others, still at its place.
- **New summits and parks:** with an Activity picked, a summit, park, island (IOTA) or castle
  you haven't worked **on that band** is marked *new*, even in a country you have confirmed: a
  spot that made no alert shows as **NEW REF** ("reference not worked on 20m"), the reference
  says *new*, the map paints it like NEW BAND and *Hide confirmed* keeps it. With no Activity
  picked nothing changes. What you have worked comes from:
  - your log, when the QSO says the reference: `SOTA_REF`, `POTA_REF` (a two-fer counts for each
    park), `WWFF_REF`, `IOTA`, `SIG` + `SIG_INFO`, and Log4OM's award references. A POTA
    reference from before POTA's 2024 prefixes is read as it is now, using the QSO's country:
    Canada's VE- is CA- now (VE-1596 is CA-1596), the USA's K- is US-, with the same numbers. An
    old one that is another country's park now (VE- is Venezuela's) and has no known new
    reference keeps the log's reference, with no place on the map, and counts for no park;
  - what DX Agent saw on the air: it remembers where each activator was and when (the last 32
    days, in `data/dxagent.db`). A QSO in your log with that station within 45 minutes of
    one of its spots counts for the summit or park it was on, even if your logger didn't write
    it (`/P` or not). Those QSOs are kept for good, in the same file. This only
    knows activations DX Agent saw, so it fills in from now on.
- Clusters have no field for this: DX Agent reads the spot's comment. It recognises the
  program's name (`POTA`, `WWFF`, `WCA`, `ILLW`, `JOTA`, `EME`...) and references by their
  format (`US-5584`, `KFF-6494`, `EU-038`, `LA/VF-010`, `DL-01121`). A spot whose spotter
  wrote neither isn't seen as an activation. Stations with YOTA in their call (GB23YOTA)
  count as YOTA.
- Like the other filters it is saved; **Clear filters** turns it off.

### CQ DX Marathon

The [CQ DX Marathon](https://dxmarathon.com) scores one point for each country and one for
each CQ zone you work: in the year (January 1 to December 31), or in the **Sprint**, ten days
in October (2026: October 17 to 26). Turn it on in Settings → **CQ DX Marathon**, pick the
year or the Sprint (and its dates) and the modes your entry counts. Then:

- A **Marathon** tab next to DXpeditions shows the period, your score (countries + zones),
  the 40 CQ zones (green = worked) and the countries: **Worked**, with the QSO that counts
  (the first one in the period: call, date, band, mode; click it to open the station), or
  **Missing**, the ones still to work. The search box finds a country by name or prefix.
  The tab's number is your score.
- A station that would add a country or a zone alerts as **MARATHON** (purple), even in a
  country you have confirmed for DXCC, and the "What you need" column says what it adds
  ("Marathon: new country (Sicily), zone 15"). Each kind can be turned off in Settings. They
  cool down per country (or zone), band and mode: one Sicilian station is enough. The
  **MARATHON** filter chip and the tab only show while the Marathon is followed.
- The Station tab says, for any call, its Marathon country and zone, and whether and when
  you worked them in the period.
- Everything follows your log: a QSO you log (file, Log4OM's database, UDP) counts at once.

What counts, as in the rules:

- **Countries:** the CQ DX Countries List, the DXCC entities plus six WAE countries:
  Sicily (IT9), African Italy (IG9/IH9), Shetland (GM/s), European Turkey (TA1), Bear Island
  (JW/b) and the Vienna International Centre (4U1VIC). A QSO's country is the ADIF `REGION`
  when your logger wrote one, else the `DXCC` field, made a WAE country when the call is in
  one (from AD1C's country file).
- **Zones:** the QSO's `CQZ`, else the call's zone in AD1C's file (which knows that W0 is
  zone 4 and VE7 zone 3). A US, Canadian or Russian station can be in another zone than its
  call says: for a spot, the zone shown is the call's.
- **The DX Marathon's lists:** DX Agent downloads the lists the Marathon publishes once a day
  (dxmarathon.com/resources/data-formats): valid calls and their notes, Zone 2, Antarctica,
  Shetland, bad spots and invalid operations. For spots and the Station tab, the list beats
  AD1C's file on the dates it gives (VY0ZOO in zone 2, a KC4 in Antarctica). For a logged QSO,
  the `CQZ` and `DXCC` your logger saved come first, as in the Marathon's submission tool, and
  the list fills in what's missing. A QSO with an invalid operation on its date doesn't count.
  In the alert list, a spot the list calls bad that day gets a red ✗; when the list gives the
  right call, the tooltip shows it. A call the list vouches for that day (the call itself, not
  a prefix: a resident, a DXpedition within its dates, a station in Antarctica, Zone 2 or
  Shetland) gets a green ✓, and in the Station tab its box is titled "Verified by the DX
  Marathon"; when the list also calls it bad, the ✗ wins. The Station tab shows the call's notes, current ones
  first. Prefix notes (`GB*`, `TC1*`...) are shown but never change where the station is.
- **Callsigns:** your main one, or the ones you tick in the card (at most 2, see Several
  callsigns).
- **Bands and modes:** 160 to 6 m; no satellites, repeaters or internet links; no /MM or /AM.
  Modes: all, or only CW, phone or digital, or the Sprint's **Classic** class (CW and phone).
- The annual Marathon is the current UTC year; until January 5th (the log deadline) it is
  still last year's. DX Agent doesn't submit your entry: upload your ADIF at
  [entry.dxmarathon.com](https://entry.dxmarathon.com).

### World map

Click **Map** (next to **List**, left of the filter chips) to see the same alerts on a
world map. The filters apply to both views.

- **Dots** are alerts, coloured like their type. A station's position comes from the
  grid square RBN reports for FT8/FT4 spots; otherwise it's the country's centre
  (marked "approx." in the tooltip). Hover a dot for the details and how long ago the
  station was spotted, click it to select it. As in the list, a dot fades 10 minutes after
  the station's last spot on that band and mode, and more after 30: a faded dot is where it
  was, not where it is.
- **Click a country** (anywhere on it, or near a small island) to see it in the Station tab,
  as a lookup shows a call's country: its card, beam headings to its centre, status, CQ DX
  Marathon box and band × mode grid.
- **Diamonds** are active DXpeditions: red = ATNO, amber = not confirmed, teal = you have the
  country but on fewer than half of your bands, grey = you have it. With an alert in the last
  15 minutes the diamond takes the alert's colour. A **green frame** means it was spotted in
  the last 15 minutes (on the air). The legend in the bottom-left corner sums this up (its chevron folds it to one word,
  "Legend", remembered in the browser). Several at
  the same place (four at Koror, Palau, say) sit on a small ring around it, each with its own
  click, the ones on the air on top. Which ones show: the **DXpeditions** menu (next to DXCC /
  WAZ / References): those **on the air** (the default), those **needed** (as the tab's "only
  needed"), **all** the active ones, or **no**; the station open in the Station tab always shows,
  and your browser remembers it.
- **Blue dot:** your QTH, from your grid square.
- **Shaded area:** where it is night right now (the greyline is its edge), updated every minute.
- **Selected station:** a dashed great-circle path from your QTH, the **beam heading**
  (and long path) and distance, and small dots for every receiver that heard it in the
  last 15 minutes (green = near you). The dots follow the **band** and **mode** filters:
  with one picked, only the receivers that heard it on that band or mode show, and none is
  left if it wasn't heard there. Its place gets a **halo** with a dot in the middle, so
  it is found among hundreds of dots, also when it made no alert at all (picked in WSJT-X,
  on the panadapter, in the lookup or in the DXpeditions tab). Picked while out of sight, the
  map centres on it; already in sight, the map stays as it is.
- **Zoom** with the mouse wheel or the **+ / −** buttons, **drag** to move,
  **⟲** to see the whole world again. Call signs of all stations appear once you zoom in;
  where they would overlap, the most important ones are shown (hover a dot for its call).
- The Station tab also shows both **beam headings**, big, each with a compass pointing that
  way and its distance: the short path in blue, the long path (the other way round the
  Earth) in orange, in either view.
- The borders are **DXCC** borders, not just countries': European and Asiatic Russia,
  England, Scotland and Wales or Mount Athos are split too. Hover anywhere on the map to see
  which entity it is. Each entity shows its prefix once it is big enough on screen (zoom in
  to see the small ones).
- Coasts and country borders come from Natural Earth 1:50m (public domain); the DXCC
  entities and the borders countries don't have, from GridTracker's DXCC map (BSD licence).
  Both are downloaded the first time you open the map and kept in
  `data/world-countries-50m.json` and `data/dxcc-shapes.json`.
- A link straight to the map: `http://localhost:8073/?view=map`.

#### Your DXCC on the map

The **DXCC** menu in the map's top-left corner paints every entity by where you stand for
an award: **green** = confirmed, **amber** = worked but not confirmed, **red** = not worked.
Next to it: how many you have confirmed and worked, out of the current entities. Hover an
entity to read its status. Pick the award in the first menu and, for Mixed, Phone, CW or
Digital, a band in the second:

- **Mixed**, **Phone**, **CW**, **Digital** with *all bands*: those awards;
- **Mixed** and a band: that band's award (160 to 6 m always; 2 m, 70 cm and up once you
  have worked them);
- **Phone**, **CW** or **Digital** and a band, say **CW** and **40 m**: your slots on that
  band and mode. That isn't an ARRL award, but it is how you chase slots;
- **Satellite**;
- **It follows the filters above the list:** with *all bands* (or **Mixed**) here and a single
  band (or mode) picked in the filters, say 12 m and DIGI, the layer paints that band and mode,
  as the dots do; the menus then say "12 m (filter)", "Digital (filter)". A band or mode picked
  here wins. The WAZ layer follows the band the same way;
- **Challenge (160–6 m)**: the more bands confirmed, the greener (0 to 10); the total
  counts band-entities, as the DXCC Challenge does.

It follows the ARRL's DXCC rules (arrl.org/dxcc-rules):

- Confirmed means **LoTW or a paper QSL** received (QSL_RCVD); eQSL doesn't count. A card
  you have received isn't credited until ARRL or a card checker has checked it, so your
  ARRL totals can be lower.
- Satellite QSOs (PROP_MODE SAT) count only for Satellite; repeater and internet QSOs
  (RPT, INTERNET, ECH, IRL), 60 m QSOs and stations at sea or in the air (/MM, /AM) don't
  count at all; QSOs before 15 Nov 1945 don't count, and CW before 1975 counts for Mixed only.
- Only the current DXCC list counts: deleted entities are left out, here and in the header's
  worked and confirmed totals (an old QSO's DXCC, as LoTW reports it, may be one: 85
  Netherlands Antilles, 151 Malyj Vysotskij).
- It doesn't check where you operated from or under which call: every QSO in your log counts.

Small entities (islands, microstates, enclaves like Vatican City or Guantanamo Bay) also get a
halo in their colour, so you can see them without zooming in.

#### Your WAZ on the map

Pick **WAZ** in the first menu (instead of DXCC) to paint the 40 **CQ zones** by where you
stand for CQ's Worked All Zones: the same green / amber / red, each zone with its number and
its borders. Hover a zone to read its name and status. Pick the award:

- **Mixed, SSB, CW, RTTY, AM**; **SSTV** (QSOs from 1973); **Digital** (from 2000, without
  RTTY, which has its award);
- a mode and a band, say **CW** and **40 m** (80-10 m from 1973; 30, 17 and 12 m from 1991),
  or **Mixed** and a band (160 m from 1975, 30 zones to apply; 6 m, 25 zones); 2 m and up
  count EME QSOs only;
- **Satellite** (from 1989, 25 zones) and **EME** (from 1973, 25 zones);
- **5BWAZ**: the 40 zones on each of 80, 40, 20, 15 and 10 m, any mode, QSOs from 1979: the
  more bands confirmed, the greener; the total counts band-zones (200; the basic award is 150).

It follows CQ's rules (n4baa.com/9_Rules.pdf, August 2026):

- Confirmed means **LoTW, a paper QSL or eQSL** (WAZ takes eQSL; DXCC doesn't).
- The zone is the one your logger saved with the QSO (ADIF CQZ), else the entity's zone from
  cty.csv. In countries with several zones (USA, Canada, Russia, Brazil, China, Australia...)
  check that your logger fills it in.
- Ships and aircraft (/MM, /AM), repeaters and internet links never count; QSOs before
  14 Nov 1945 don't either.
- Not checked: that you operated from one DXCC entity, and the Traditional / Remote categories.

#### The azimuthal map (your QTH in the centre)

The first menu in the map's bar picks how it shows the world: **Rectangular** (the usual one) or
**Azimuthal**: azimuthal equidistant, centred on your grid square (Settings → Grid square, or your
log's MY_GRIDSQUARE; without one the option is greyed). The short path to any station is a straight
line from the centre: its **beam heading** is the angle, north up, and its **distance** the radius,
with circles every 2,500 km (labelled every 5,000) and the headings every 30° round the edge. The
edge is your antipode: the land around it is stretched along the rim, as on any azimuthal map.

Everything the rectangular map shows is there too: the DXCC, WAZ and Grids views with their menus,
the CQ zones, the References layer, the countries' prefixes, the night (greyline), your QTH, the
alerts and DXpeditions (with the filters above the list), the stations on the air in their square,
and the station picked, with its straight path, heading and distance. Under the mouse, a dashed
line from your QTH says the beam heading and distance to that point ("47° · 9,850 km"), and in
the Grids view the square's card shows as on the flat map. A click on a country opens it in the
Station tab; the wheel, **+ / −** and dragging zoom and move, **⟲** shows the whole world again.
The browser remembers the choice.

It is drawn with d3-geo (https://d3js.org, ISC license), which comes inside DX Agent
(`dxagent/static/vendor/`, with its license): nothing is downloaded for it.

#### Your grid squares on the map (as GridTracker)

Pick **Grids** in the first menu (instead of DXCC or WAZ) to see the Maidenhead grid: the 324
fields (FN, GF...) with their lines and names, and zoomed in the squares (FN31) with theirs. The
squares you worked are painted: green confirmed, amber worked. Pick what counts:

- **Mixed, Phone, CW, Digital**, and a band: **6 m** for FFMA, one band for VUCC (all bands by
  default); a band or mode picked in the filters above the list is used while the menus say
  "all bands" or Mixed, as for DXCC;
- **Satellite**: the QSOs by satellite (PROP_MODE SAT), which count for no band.

The summary says how many squares are confirmed and worked, and in how many fields. Hover a
square for what you have there (each band and mode, ✓ confirmed) and who is on the air in it.

**On the air** (ticked by default) puts the stations heard with a locator in the last 15
minutes in their square, alert or not, like GridTracker: those your WSJT-X decodes (their CQ
says the locator) and the RBN's FT8/FT4 spots, on the bands and modes you alert on. A square
outlined in **red** is one you haven't worked on that station's band; in green, one you have.
Their calls show zoomed in; click one for the Station tab.

It follows VUCC's rules: confirmed means **LoTW or a paper QSL** (eQSL doesn't count), and
repeaters and internet links never count. The square is the QSO's GRIDSQUARE (its first 4
characters), and every square in VUCC_GRIDS for a station on a line or a corner. LoTW's
confirmations carry the other station's locator, so they confirm its square. A QSO your logger
saved without the locator counts for no square.

To be told when a new square is on the air, tick **New grid square** under **Alert me for** in
Settings (off by default): a **NEW GRID** alert for a station in a square you haven't worked
on that band, any mode. Only spots that say the locator can: your WSJT-X's decodes and RBN's
FT8/FT4 spots, not the DX cluster's.

**CQ zones** (the box in the menu) shows the zones' borders and numbers in any view, DXCC
or none.

### Safety

- The dashboard only listens on `127.0.0.1`, so other computers can't reach it.
- It only answers requests addressed to `localhost` (protection against
  DNS-rebinding tricks from websites).
- Settings can only be saved from the dashboard page itself. Other websites you visit
  can't send a request that changes them, and can't show the dashboard inside their
  own page.
- Text from spots (cluster comments come from anyone on the internet) is always shown
  as plain text, never run as code.

---

## 3. Settings page

Click **Settings** in the header (or open `http://localhost:8073/#settings`). Change
what you need and click **Save and apply**: the agent rewrites `config.toml`,
reloads your log and reconnects the feeds within a few seconds. You don't need to
restart it. The settings are in tabs, one group at a time (the one open is remembered); the
**Log** tab only shows with DX Agent's logbook as your log.

| Section | What you can set |
|---------|------------------|
| **Station** | Your callsign; **Your log**: an ADIF file from your logger, **LoTW only** (see LoTW as your log), or **Start from scratch** (see A new log); the path to your ADIF log (one per line; `*` picks the newest file, e.g. `…/CALL_*_backup.adi` for Log4OM backups). **Browse…** opens the Windows file window to pick the file (if you pick a dated Log4OM backup, it becomes `…/CALL_*_backup.adi` so the newest is always used). **Test** shows which file it found, its size, date and QSO count; your grid square (empty = taken from your log); **Your other callsigns**, each with its own log (see Several callsigns) |
| **Log** | Only with DX Agent's logbook: **Import ADIF…**; TQSL (where it is) and each callsign's TQSL Station Location, for uploads to LoTW; your Club Log email and application password, for uploads to Club Log; each callsign's QRZ.com Logbook API key (with **Test**), for uploads to and downloads from QRZ (see DX Agent's logbook) |
| **LoTW** | Turn the confirmation download on or off; LoTW username (empty = your call); LoTW password; how often to download. **Test login** checks the username and password with LoTW |
| **Alerts** | Which alert types you want (and **Your own call**: who hears you; a type turned off also leaves the list: an alert only for it goes, another one shows its next headline, NEW BAND rather than NEW CALL); bands; modes; when a DXpedition or watchlist call counts as worked; watchlist; ignore list; how long before the same alert repeats and **Keep only the latest row of each station** (same call, band and mode, within 3 kHz of its frequency: a spot a little off it, as happens on FT8, is the same station; when it shows up again, its older rows leave the list); **Take out of the list after** N minutes (stations not spotted on that band and mode for that long leave the list; 0 = never, the default); the "near you" radius and **Only alert when heard near you**; Windows pop-ups and for which alerts |
| **Spot sources** | DX cluster on/off, its servers (`host:port`, tried in order) and login commands; **Recent spots on connecting** (minutes, 0 = off); which continents' cluster spotters to use; RBN on/off, CW/RTTY and FT8/FT4 feeds; which continents' skimmers count |
| **Radio (Tune button)** | For **Radio 1** and, if you use two, **Radio 2** (see Two radios): which program tunes it (Off, Log4OM 2, N1MM Logger+, DXLog.net, OmniRig, Hamlib rigctld, flrig, DXLab Commander, TCI), its name, its address and port (0 = default), whether to set the mode too, which OmniRig radio, and with Hamlib whether DX Agent starts rigctld and with what arguments; for **Both radios**, WSJT-X, split, and — shown only with a radio on TCI — whether the alerts go on the panadapter and what a Tune does while the radio transmits, and — shown only with a radio on flrig — whether a Tune goes through flrig; and **CW with WinKey**: its port, speed and messages (see DX Agent's logbook) |
| **CQ DX Marathon** | Follow it or not; the year or the Sprint, and the Sprint's dates; the modes that count (all, CW, phone, digital, or Classic: CW and phone); alerts for a new Marathon country and for a new zone |
| **VHF openings** | Watch the stations near you hearing far ones, and the stations hearing you; the bands (6 m, 2 m); how far from you is near; how many stations must hear it, and how many there; what a place is (a country, a continent, a grid field); at least how far, and the time to live, for each band; the grace before closing; how far off north-south a TEP path may cross; meteor scatter; 10 m short skip; 2 m tropo from the weather forecast; leave out moonbounce; a Windows pop-up when the band opens (see VHF openings) |
| **Ventanas** | Count the hours each country you miss is heard from near you, and show them in the Ventanas tab; how far from you counts as near; the months kept; how often the same spot counts; whether a spotter known only by its country counts, and whether your own country is left out; the hour's alert (on at least how many days, at most how many countries, heard within how many days) and its pop-up (see Ventanas) |
| **DXpeditions, log and dashboard** | Show DXpeditions you already have; DXpedition sources and how often to re-read them; how often to check the log file; dashboard port; open the browser on start |

How it behaves:

- **Checks before saving.** A callsign that doesn't look valid, an empty log path, no
  bands, a cluster server without `:port` and similar mistakes are listed in red, and
  nothing is saved until they are fixed.
- **Backup.** The previous file is kept as `config.toml.bak`.
- **Your LoTW password** is stored encrypted for your Windows user in
  `data/lotw.secret` — never in `config.toml` — and is never shown again. The box
  says whether a password is saved. Leave it empty to keep the saved one; tick
  **Forget the saved password** to remove it.
- **Dashboard port** changes take effect the next time you start DX Agent.
- **Comments.** Saving rewrites `config.toml` with its own short comments; comments
  you added by hand are not kept.

---

## 4. Commands

All commands run from the project folder as `python -m dxagent <command>`. `run` is
the default.

| Command                 | What it does                                                                     |
|-------------------------|----------------------------------------------------------------------------------|
| `run`                   | Watches cluster and RBN, serves the dashboard, alerts on needed stations until Ctrl+C |
| `dxpeditions --days 30` | Lists active DXpeditions and those starting in the next N days, with your status and LoTW for each |
| `check CALL`            | Shows the worked/confirmed grid for that call's country, by band and mode       |
| `stats`                 | Counts countries worked and confirmed per band and per mode                     |

Run the tests with:

```powershell
python -m unittest discover -s tests -t .
```

### `check` example

`C` = confirmed (LoTW or paper QSL), `W` = worked but not confirmed, `.` = not worked.

```text
VP2MAW: Montserrat (DXCC 96, NA, CQ 8) - no LoTW
          160m   80m   40m   30m   20m   17m   15m   12m   10m    6m
      CW     .     .     .     .     C     C     W     .     C     .
   PHONE     .     .     .     .     C     .     .     .     .     .
    DIGI     .     .     .     .     .     .     C     .     .     .
  C = confirmed (LoTW/QSL)   W = worked, not confirmed   . = not worked
  this call: not in log
```

### `dxpeditions` status column

- `NEED: ATNO` — country never worked.
- `NEED: not confirmed` — worked, but no confirmation on any band.
- `have: 4 bnd, 2 cfm` — worked on 4 bands, confirmed on 2. `(wkd 15,20)` means you
  already worked this DXpedition call on those bands.

The LOTW column shows the station's last upload date, `LoTW announced` (the DXpedition
listing says QSL via LoTW but nothing is uploaded yet) or `no LoTW`.

### `stats` example

```text
        worked   cfm
  160m      58    41
   80m     121    97
   40m     203   181
   ...
    CW     247   226
 PHONE     219   190
  DIGI     232   208
 total     271   248
```

---

## 5. Reading the alerts

Each alert is a row on the dashboard and one line in the terminal: time (UTC),
headline, call, frequency (kHz), band, mode, country, then details separated by `|`.

```text
14:56Z DXPED NEED  VP2MAW   18095.0   17m FT8   Montserrat   NEED: 17m DIGI never worked | until 10-20 | no LoTW | rbn NG7M -14dB
14:55Z DXPED HAVE  VP2MAW   14030.0   20m CW    Montserrat   have it: 20m CW confirmed | until 10-20 | no LoTW | rbn WE9V 7dB 27wpm
14:55Z NEW BAND    SV2GNJ   18100.0   17m FT8   Greece       LoTW 2022-05-10 | rbn WZ7I -8dB
```

- **Mode** comes from RBN or from the cluster comment. When it has to be guessed
  from the band plan it is shown with a `?`, e.g. `CW?`.
- **Last detail:** `rbn SPOTTER SNR WPM` for skimmer spots, or
  `de SPOTTER: comment` for cluster spots.
- **Square brackets** at the end list every reason when there is more than one,
  e.g. `[new_band, new_mode]`.

### Alert types

| Headline   | Meaning                                                                      | Default |
|------------|------------------------------------------------------------------------------|---------|
| ATNO       | Country never worked                                                         | on      |
| DXPED NEED | Active DXpedition that adds a new country, band, mode or band+mode for you   | on      |
| DXPED CFM  | Active DXpedition for a country you worked but haven't confirmed on this band or mode | on |
| DXPED HAVE | Active DXpedition you already have confirmed on this band and mode (grey, no pop-up) | on |
| NEW BAND   | Country worked, but not on this band                                         | on      |
| NEW MODE   | Country worked, but not in this mode group (CW, PHONE, DIGI)                 | on      |
| WATCHLIST  | A call from your watchlist, not yet worked                                   | on      |
| NEW SLOT   | Country not worked on this band+mode combination                             | off     |
| NEW GRID   | Grid square not worked on this band, any mode (VUCC, FFMA). Only spots that say the locator: your WSJT-X's decodes and RBN's FT8/FT4 (see Your grid squares on the map) | off |
| NEW PREFIX | A prefix you have never worked, on any band or mode, as the CQ WPX award counts them: the letters and digits up to the last digit before the suffix (LU1ABC: LU1, HG19ABC: HG19), a portable's other prefix (N8BJQ/KH9: KH9, PA/N8BJQ: PA0, N8BJQ/7: N7; /P, /M, /QRP don't count). What you need says it ("prefix N1 never worked"), and the Station tab ("Prefix N1: NEW PREFIX", or worked). Far fewer than NEW CALL: once you work one station in a prefix, the others there don't alert | off |
| NEW CALL   | This exact callsign isn't in your log (very noisy)                           | off     |
| MARATHON   | A country or CQ zone you haven't worked yet in the CQ DX Marathon (see CQ DX Marathon) | on, while the Marathon is followed |
| YOU'RE HEARD | Your own callsign spotted (any of yours, on any band and mode), by the cluster, the RBN or, with PSKReporter live, a PSKReporter receiver (each one once per band every 5 minutes: FT8 reports every CQ): who hears you, and how far away, in What you need ("heard 8,912 km away, in United States"); the row is highlighted in pink and follows the latest spot (×N skimmers). Click it for every receiver that heard you, nearest first, and on the map | on (`alerts.self_spots`) |
| 50 MHz, 144 MHz | 6 m or 2 m open (its filter: 50-144 MHz): stations near you hear stations far away, or stations far away hear you (see VHF openings); highlighted in green | off (`vhf.near`, `vhf.self`) |
| ITS HOUR | A country you still need that is usually heard from near you at this UTC hour, on that band and mode (see Ventanas): what was heard, not a prediction. One row at the top of each hour, at most `windows.alert_max` countries in it, the next few named | on (`windows.alert`) |

"Default" refers to **Alert me for** on the Settings page (`alert_on` in the file).

The list and the map keep the last 500 alerts. When the list is full, the least important go
first: the oldest NEW CALL and DXPED HAVE, or any alert over an hour old. The others (ATNO, a
new band, mode or slot, a DXpedition, the watchlist, the Marathon) stay at least an hour, so
NEW CALL, which can bring a hundred alerts a minute, doesn't push them out.

When your log changes (you work the station), the alerts already listed follow: a reason that
no longer holds leaves (a NEW SLOT you then worked isn't one any more, nor under that filter),
and the headline, colour and "What you need" with it. A DXpedition stays one until you work it
on that band and mode (DXPED NEED, CFM or HAVE by what it still adds, even once its list no longer
has it); worked there, it goes as any other: working it again won't confirm it. An alert with no
reason left shows as **WORKED** (grey).

### Where the DXpeditions come from

Three public sources are merged by call sign (choose them in Settings →
**DXpedition sources**; all three are on by default):

| Source | What it adds |
|--------|--------------|
| **NG3K ADXO** | The best-known calendar of announced operations, with dates, QSL route and notes |
| **425 DX News** | The Italian weekly bulletin's calendar: many operations NG3K doesn't list yet. Special-event and anniversary calls are left out |
| **Club Log** | Expeditions uploading their log to Club Log right now (a log updated in the last 3 days counts as on the air), a link to search the log and request an OQRS card, and the **DXCC Most Wanted** rank |

When the same call is in more than one source, the QSL route and notes come from NG3K
first, then 425 DX News, and the operation lasts until the latest date any of them
gives: announced for October and then for November too, or extended, it goes on alerting
to the end. Club Log adds its link and, because its dates are real QSOs, can stretch the
dates. The same call on two separate trips (now and next year, or another island:
VY0ZOO on NA-007 and then on NA-174) stays two entries. Each card in the DXpeditions tab
shows its sources and the Most Wanted rank; the Station tab links each source and the
Club Log log.

**Order.** **On the air** puts first the DXpeditions spotted in the last 15 minutes, the latest spot on top, and the rest by Most Wanted; one that goes 15 minutes without a spot drops back. **Most Wanted** (the default) puts the most wanted countries first, by Club Log's rank, and those without a rank last; **Date** sorts by the announced start date. The browser remembers your choice. 425 DX News sometimes
gives only an end ("till 31/10"); the start is then read from the bulletin text
("from 20 September to…", "on 8-11 October", "between 7 and 21 October"). When the
text doesn't say either, the card shows **until 10-31** and goes first, since it is
already on.

**On the air.** A DXpedition spotted (cluster or RBN) in the last 15 minutes gets a
green frame and an **ON THE AIR** line with the frequency (click it to tune), band,
mode, how long ago and who spotted it. The DXpeditions tab shows how many are on the
air (**● 4**) even while you look at the Station tab, the map rings their diamonds,
and a message pops up in the dashboard the moment one comes on. This happens for every
active DXpedition, needed or not and on your watchlist or not; **only needed** never
hides one that is on the air.

**In the Station tab.** Open a DXpedition's call and the **DXpedition** box shows its
dates, QSL, sources and what the announcement says. Also before it starts: when that call
has one announced further ahead, the next one is shown, with **starts in 17 days** (or
**starts tomorrow**) beside the dates. Until it starts it gives no alerts.

### Are you in their log?

When you open an active DXpedition in the Station tab and its log is on Club Log, the
DXpedition box checks Club Log's log search for your callsign: the band slots where you
are in their log (✓), the ones they have been on the air that you still need (·), and two
warnings: **in your log but not in theirs** (a busted call, a QSO they didn't log, or a
day not uploaded yet: the last upload date is shown) and **in their log but not in
yours** (a QSO missing from your log). It asks only when you open that station and keeps
the answer for 10 minutes; it says when it asked. Just worked them? **↻ Refresh** asks
Club Log again at once (your QSO shows there once they upload it). Many DXpeditions don't use Club Log: then it shows the web
addresses from their announcement (NG3K, 425 DX News), where their own log search or
OQRS usually is.

### Do I need this DXpedition?

The text after `NEED:` says exactly what working it adds, most important first:

| Text                                                   | Meaning                                                    |
|--------------------------------------------------------|------------------------------------------------------------|
| `ATNO`, `new band`, `new mode`                         | Something you have never worked                            |
| `17m DIGI never worked`                                | You have the band and the mode, but not together           |
| `entity not confirmed`, `band not confirmed`, `mode not confirmed` | Worked, but no LoTW or paper QSL (eQSL doesn't count) |
| `have it: 20m CW confirmed`                            | Nothing new — work it only if you want to                  |

The headline summarises it: **DXPED NEED** when something is new, **DXPED CFM** when
the gain is a confirmation, **DXPED HAVE** when there is nothing to gain.

### Colours and pop-ups

| Priority | Colour        | Pop-up | Alerts                                                              |
|----------|---------------|--------|---------------------------------------------------------------------|
| 1        | white on red  | yes    | ATNO                                                                |
| 2        | yellow        | no     | NEW BAND; DXPED NEED/CFM for a new band or mode, or an unconfirmed country |
| 3        | cyan          | no     | NEW MODE, WATCHLIST, NEW GRID, NEW PREFIX; DXPED for a new band+mode or an unconfirmed band/mode |
| 4        | green         | no     | NEW SLOT; DXPED for an unconfirmed band+mode                        |
| 5        | grey          | no     | NEW CALL, DXPED HAVE                                                |

By default only ATNO pops up (`notify_max_priority = 1`), in Windows and in the dashboard. To get
pop-ups for priority 2 or 3 alerts too, change it under
**Windows pop-ups** on the Settings page. Every alert is also
kept in `data/dxagent.db` (the last `keep_days` days).

### Near you: is the station reaching your area?

A strong signal on another continent means little if it isn't reaching you. DX Agent
records **every** RBN and cluster spot (not only the ones that alert) together with
where the receiving station is, and for each alert shows the nearest one that heard
it in the last 15 minutes on that band:

| Shown | Meaning |
|-------|---------|
| **● 732 km · 7 dB** (green) | Heard near you: a station within your "near" radius (default 1,500 km) heard it, at that SNR |
| **8,176 km** (grey) | Only heard further away; this is the nearest receiver |
| **—** | No RBN or cluster reports in the last 15 minutes |
| **~** before a distance | Approximate: a human cluster spotter, placed at their country's centre |

- **Where receivers are:** RBN skimmers come from RBN's own skimmer list, with
  exact grid squares, downloaded daily. Cluster spotters are placed at their
  country's centre from `cty.csv`.
- **Your location:** the grid square from Settings. If it's empty, it is taken from
  `MY_GRIDSQUARE` in your log.
- **Updates:** the column refreshes every 20 seconds, because nearby receivers often
  report a station a little after the first spot.
- **Filter or setting:** the **Near you only** chip only *hides* the alerts not heard
  near you: they still alert, and show again when you untick it. **Only alert when heard
  near you** in Settings decides what *alerts*: a station heard only far away never
  alerts (no row, no pop-up) until someone near you hears it. Where few receivers are
  near you (the south of South America, say) that drops nearly every spot, and the list
  stays almost empty: then the dashboard says, next to how many are listed, how many
  stations it kept from alerting in the last hour ("1,240 didn't alert: heard only far
  away", a click opens Settings). Usually the filter is what you want.
- **Station tab:** **Who hears it** lists the receivers nearest you first, with band,
  SNR and age. Its summary is for the band of the station's path (the row you clicked, else
  the band it was spotted on last): heard on 20 m, your own WSJT-X included, says nothing
  about 17 m. "On 17m, no reports in the last 15 minutes. Heard near you on 20m." The table
  keeps every band's reports, each with its band. **Check PSKReporter (FT8/FT4)** asks PSKReporter, which has many more
  FT8 receivers in South America than RBN has skimmers. Its receptions are added to
  "near you", so the summary and the table's column update too. The answer is cached
  for 5 minutes per call. PSKReporter asks for **at most one query every 5 minutes**
  (for all stations together) and blocks connections that query more often (HTTP
  429), so DX Agent enforces that limit, shows when the next query is allowed, and
  after a block waits at least 15 minutes before trying again.
- **PSKReporter live:** in Settings → Spot sources, **PSKReporter** can be **Live
  (MQTT)** instead of **When you ask**. DX Agent then connects to
  mqtt.pskreporter.info, which passes on every report sent to PSKReporter as it
  arrives, with no account and no query limit, and follows:
  - your own calls, with **YOU'RE HEARD** on: every receiver that reports you is a
    spot of your call (YOU'RE HEARD), with its distance from its locator;
  - the station open in the Station tab, from the moment you open it, for 15
    minutes after you last looked at it;
  - the digital (FT8, FT4…) alerts in the list spotted in the last 15 minutes;
  - with **Only alert when heard near you** on, the digital stations it kept from
    alerting: as soon as a nearby receiver reports one on that band, it alerts right
    then, on the spot it was kept from.

  It follows at most 100 stations, by call: never a whole country (receivers in the
  USA alone send about 300 reports a second). Their receivers count for "near you" on
  their own, with no button. **Who hears it** lists them as PSK, and the Station tab
  says since when the station is followed and how many receivers have reported it.
  Only new reports arrive: right after you open a station the list is empty, and
  receivers show up as their programs send them, usually within a few minutes. A
  **PSKReporter** pill next to the feeds shows the connection and the reports
  received. Live needs your grid square.

How many receivers are near you depends on where you are: RBN skimmers are dense in
North America and Europe and sparse elsewhere, while PSKReporter usually has many
more FT8 receivers.

### The path: does your signal get there?

"Near you" says whether the station is heard in your area; the **path** says whether your own
signal gets to its area, from what is measured in the last 15 minutes on that band:

- **out, your signal gets there:** a receiver within 500 km of the station (its locator, else its
  country's centre) reported one of your calls: an RBN skimmer, a cluster spotter, or a PSKReporter
  receiver (with PSKReporter live, your calls are followed). 500 km fixed, or your "near you"
  distance when smaller: that distance is a radius around you, and 1,800 km around Iceland is
  already England and Denmark, another path;
- **in, it gets here:** your WSJT-X decoded the station, or a station with a locator within those
  500 km of it; else a receiver near you heard it ("near you"). A decode of the period in which
  WSJT-X's dial moved to another band isn't taken: that audio is the old band's.

The **Near you** column shows it before the distance: **⇄** (green) both ways, **→** (green) your
signal gets there, **←** (amber) it gets here but your signal hasn't been reported there yet,
a faint **·** nothing measured yet; hover for who and when. The Station tab says it in words on the band of the row clicked (else the
station's latest spot): "Path 20 m: Your signal gets there · HA8RX heard you 120 km from it, 4 min
ago (-15 dB, PSKReporter)", or that there's no sign yet. It is a measurement, not a prediction: the
more you transmit (a few CQs on FT8), the more of the map it knows; with nothing measured it says
nothing, which doesn't mean the band is closed.

### The prediction: VOACAP

The path says what is measured; **VOACAP** says what to expect: the month's median ionosphere for
the sunspot number, at that hour, between you and the station. DX Agent has VOACAP built in (a
Python port of VE3NEA's DVOACAP, MIT license, which gives VOACAP's own results; nothing to
install). It needs your grid square.

It works it out both ways, your signal there and theirs here, each station taken to be like yours
(**Settings → Propagation**: your power, your antenna's gain over isotropic, about 3 dBi for a
dipole or a vertical and 8 to 10 for a Yagi, and the man-made noise where you are: residential,
rural or quiet); a QSO needs both, so the worse one counts. The chance is VOACAP's reliability:
how often in the month the SNR reaches what the mode needs, in 1 Hz: CW 24 dB and SSB 45 (as
voacap.com's setup guide), FT8 13 and FT4 17 (their decoding limits, -21 and -17.5 dB in
2,500 Hz), RTTY 34; other digital modes as FT8.

**Short path and long path.** It works out both: the short path, the most direct, and the long
one, the other way round the world (40,000 km less the short one, the antenna turned round 180°).
On each band and hour the one whose worse way has the better SNR counts; on a tie, the short one.
Beside the percentage, the list says **SP** (short path) or **LP** (long path, highlighted).
When the long one is better, with a chance of 10% or more, the Station tab stripes that hour, and
the tooltip says the distance and the bearing to point the antenna at (from South America, Japan on
15 m at dusk, say). In the Station tab's **Beam**, the path that is better now on the row's band
and mode is highlighted, with its chance, and the other one faint. Long paths are nearly always
over 10,000 km, where VOACAP uses a simplified model: that prediction is rougher than the short
path's. What is measured (the path) can't tell the two apart: a report doesn't say which way the
signal came.

Where to see it:

- The **VOACAP** column in the list: the chance on the row's band and mode at this hour, green
  from 50%, amber from 10%, grey under it; hover for the SNR each way, the MUF, the settings,
  and the path's bearing (**SP** or **LP**, beside the percentage). Click the header to put the best
  chances first. The stations in the list are worked out in the background once an hour (each place
  rounded to half a degree), so a new one shows its figure within a few seconds. VOACAP stops at
  30 MHz: nothing on 6 m and up. VOACAP's SNR is in 1 Hz; for FT8 and FT4 the tooltip also gives it
  as WSJT-X reports it, in 2,500 Hz, 34 dB less (27 dB in 1 Hz is about -7 dB in WSJT-X).
- **Propagation (VOACAP)** in the Station tab: the next 24 hours by band (your alert bands), each
  square greener the better the chance, for CW, SSB, FT8, FT4 or RTTY (the row's mode at first);
  hover a square for its figures. Above it, the row's band now. Striped, the hours better by the
  long path; under it, each path's distance and bearing.

#### Where the sunspot number comes from

VOACAP doesn't invent the ionosphere: it takes it from a month's maps made for a sunspot number,
and that number is what moves it. More sunspots, and the foF2 and the MUF go up and the high bands
give a better chance; fewer, the other way round, and the low bands hold better. That is why DX
Agent doesn't use the month's but today's:

- **KC2G's effective one** ([prop.kc2g.com](https://prop.kc2g.com/), by Andrew Rodland, KC2G, with
  the ionosonde data of GIRO): the number that best fits what the ionosondes around the world
  measure, worked out every 15 minutes and asked for once an hour. With it the prediction follows
  today's ionosphere, not only the month's: after a geomagnetic storm, when the bands drop, it drops
  too. Its name is next to every prediction.
- **NOAA SWPC's, as a fallback**: when KC2G has had none for 6 hours, or when
  **Settings → Propagation → Sunspot number** is off, it is the one NOAA predicts for the month
  (downloaded once a day).

#### The ionosondes: today's ionosphere

With **Settings → Propagation → Ionosondes** on (it is, out of the box), DX Agent reads KC2G's
`stations.json` every 15 minutes — where each ionosonde is, when it measured and its foF2, MUF(D)
and hmF2 — and uses it **inside** the prediction, for **every** one it makes: the list's VOACAP
column, the Station tab's 24 hours, the Ventanas tab (the country's hours and the hour's alert) and
the 6 m F2. Two things come out of it:

- **A sunspot number per zone**: the one that makes VOACAP's maps give the foF2 and MUF(D) the
  stations around that path measure.
- **A correction of the foF2** at the points the path goes through: the first one, near you (the
  first hop), and the last one, near the DX. It counts more east to west than north to south, never
  crosses the equatorial anomaly (a station on one side doesn't correct the other), and the older
  measurement — and the one the station's autoscaler calls doubtful — weighs less.

A measurement weighs by its age: an hour and a half old it is worth half, and past six hours it
isn't used. The correction also **fades forwards**: it holds for the moment measured and eases back
to the effective number over the hours predicted (three hours ahead half of it is left). At
night the measurements don't move the number — the night foF2 wanders with spread F far more than
it follows the sunspot number — and neither does a fit that ends against its bounds or far from the
effective one, which is what a runaway autoscaler or a storm the maps don't know about looks like.

**With no ionosonde near a path** the prediction is the old one: the maps with KC2G's effective
number and, if there is none either, NOAA's. A zone with no ionosonde of its own takes that number.
Turned off altogether (**Settings → Propagation → Ionosondes**, or `iono_source = "off"`), none of
this is used. A station can be asked for by name (`[propagation] stations = ["TUJ2O"]`) and the
radius changed (`iono_radius_km`, 2,000 km out of the box).

**Where each prediction comes from** is said beside it, with the credit of each station and each
provider:

- *VOACAP with Tucumán (KC2G, INGV/eSWua), 12 min*: the number and the correction came from what
  Tucumán measured 12 minutes ago — when there is more than one station, the two nearest ones.
- *VOACAP, sunspot number 92 (KC2G eSSN, prop.kc2g.com)*: no station had anything better to say;
  it is the maps with that number.
- *foF2 30% below the month's median near Tucumán*: the stations see the ionosphere far from what
  the maps say; it tells you why the prediction moved.
- *No ionosondes*: nothing measured in the last six hours.

On 6 m there is a second proof of Es: an ionosonde within 500 km of you that measures an foEs of 8
MHz or more means the cloud that opens 6 m is overhead, and it is said next to the 10 m short
skip's warning — the same phenomenon, measured two ways.

#### VOACAP against the air: how often it is right

Beside the chosen station's prediction, the Station tab says what happened in the last hour:
"VOACAP said 20 m at 15% towards JA; 6 receivers near you heard it". It counts the distinct
receivers **within your "near you" distance** that reported a station in that zone (RBN, cluster
and PSKReporter) during the hour. A report from a receiver far away — a Japanese skimmer hearing a
Japanese station — only says the band is in use there, not that it reaches you.

Heard near you, the path was open: a hit when VOACAP said open, and it fell short when it said
closed. Heard only further away, and with 3 or more receivers near you reporting **on that same
band** that hour, the band was closed from here: a hit when VOACAP said closed, and too optimistic
when it said open. Receivers near you that are all on 40 m say nothing about 15 m, so they don't
make it closed. If nobody heard it on that band in the hour, nothing is compared: either VOACAP was
right or the station wasn't on the air, and the air alone can't say which.

Under the 24-hour grid, **VOACAP against the air** sums up the last 30 days, band by band:

- **right**: it called it open and it was heard near you, or it called it closed and nothing came
  through.
- **short**: it called it closed and it was heard near you. With this column high, try the band even
  when VOACAP calls it closed.
- **optimistic**: it called it open and it was only heard far away, with at least those 3 receivers
  of yours reporting on it. With this column high, don't trust it when it calls it open.
- **hours**: the cases behind the row. With a few, the percentage means little.

Under it, **By UTC hour**: the 24 hours of the UTC day, the greener the more often it was right at
that hour (hover a square for its figures). It is **every zone** of the list added up, not the chosen
station: what that station did in the last hour is the line beside the prediction. What is compared
is the prediction the app shows, ionosondes included. The same, in more detail, is in each column's
tooltip and in the "?" beside the title.

It is still a prediction: a given day the band may be better or worse, and the path, when something
is measured, says what is happening now. Where the station is: the locator it last gave, if not the
centre of its country (the tooltip says so).

#### For whoever wants to know more

None of this is needed to use the program; it is for whoever wants to look under the bonnet.

- The comparisons are kept in `data/propcheck.db` (a row per hour, DX zone and band, 30 days), with
  the sunspot number predicted with and its source, whether that zone took the ionosondes, and how
  many receivers near you were reporting on that band and altogether. The rows with no verdict
  (nobody heard it on that band, or fewer than 3 of your receivers on it) are kept but don't count.
- Every prediction is also worked out **without** the ionosondes and kept beside it (`rel_base`), so
  the two are compared against the same air and it can be said whether the ionosondes improve
  anything.
- The measurements, as they arrive, are kept in `data/ionohistory.db` (30 days) for the calibration:
  `python -m dxagent.calibrate`, from the folder DX Agent is installed in, reads that history and
  `propcheck.db` and prints what each set of constants would get wrong (leaving one station out at a
  time), how long a correction lasts, whether the anomaly rule earns its keep, and how often VOACAP
  calls a band open when it wasn't at each threshold. It changes nothing: the constants are yours to
  set. Neither the history nor the measurements are shown or exported: they are GIRO's, NOAA's,
  INGV's and BoM's.
- The constants behind all this, the ones the code uses: near you 1,500 km, 3 receivers to call a
  band closed, a 10% chance to call it open, a one-hour window; ionosondes within 2,000 km of a
  control point, a half-life of 1.5 h, nothing older than 6 h, a confidence of at least 25, the
  anomaly at 25° of dip; the number's fit between −20 and 200 and no more than 50 from the effective
  one; the correction fading with a 3 h life; the foF2 notice from 20%; and on 6 m, an ionosonde
  within 500 km measuring an foEs of 8 MHz.

### VHF openings: 6 m and 2 m

**In short.** On 6 and 2 m DX Agent doesn't predict with a model, as VOACAP does on HF: it
**watches what is happening now**, with PSKReporter's live reports. There are two ways to see it:

1. **Your neighbours hear far.** When 3 different stations within 200 km of you hear stations in
   the same place (at least 2 different ones), the band is open there.
2. **You are heard.** When 3 different stations in the same place report your signal, your signal
   gets there.

To keep false alarms down, only long distances count (800 km on 6 m, 300 km on 2 m) and moonbounce
doesn't. An opening closes when a few minutes go by with no reports (10 on 6 m, 5 on 2 m). Each
opening gets a label for what it probably is (Es, TEP, F2, aurora, tropo), from the band, the
distance, the time and the Kp.

On 2 m it can also **see tropo coming** from the weather forecast. Once an hour it works out, at
your QTH and at 24 points around it, how the air's refraction changes with height. Where it falls
very fast there is a duct, and a 2 m signal is trapped in it and travels hundreds of km. On 6 m,
strong 10 m short skip means a dense Es cloud, and warns that 6 m may open.

Each calculation in detail is below.

Es, TEP and tropo open and close in minutes, and VOACAP stops at 30 MHz. **Settings → VHF
openings** watches PSKReporter's live reports (MQTT, mqtt.pskreporter.info, on a connection of its
own; it needs your grid square) and puts a **50 MHz** or **144 MHz** alert in the list when the band opens. Two
ways, each turned on by itself:

- **Stations near you hearing far ones**: when several stations within the **Near you** distance
  (200 km) hear stations in the same place (3 different stations near you, hearing at least 2
  different ones there: one strong station or a beacon heard by everyone isn't an opening), the
  band is open there. The row is the station heard there by the most stations near you, so Tune
  and the Station tab work as for any alert. Good where there are active stations around you.
- **Stations hearing you**: when several far stations in the same place report you (3), your
  signal gets there. Only while you transmit (FT8, FT4, CW...); good where no one else is on.

A place is a country (DXCC), a continent or a grid field (GF, FN...). Only stations at least this
far apart count (6 m 800 km, 2 m 300 km: a neighbour by ground wave isn't an opening, and on 2 m
tropo counts), and a report counts for its band's time to live (6 m 10 minutes, 2 m 5). The
moonbounce modes (JT65, Q65, JT4, QRA64) don't count unless you say so: by the Moon the band is
"open" to anywhere it is up.

What you need says it ("Es · open to Japan: 3 near you hear 2") and, under it, who
hears whom. An opening alerts once (it beeps with the sound on, and pops up in Windows unless you
turn that off), and its row follows it: more stations, and "closed" once a whole time to live goes
by with no report for it. Back within **Grace before closing** (10 minutes) it is the same opening:
its row opens again, with no new alert. After that, the next opening there alerts again. The row
fades from its last report: fainter after 5 minutes, a ghost after 15, so you see the trail, and
it leaves the list 45 minutes after it (a tropo one, steadier, after 60), whatever **Take out of
the list after** says, unless you pinned it. The
**VHF** pill in the header is its connection, and the 50-144 MHz filter shows its alerts.

**What it probably is**, first in the row: Es, multi-hop Es, F2, TEP, aurora, tropo or meteor
scatter. It is a label, by the band, how far, where the paths go and the planetary Kp; what opens
the band is still the stations hearing it:

| Label | When |
| --- | --- |
| Aurora | Kp 5 or more (a geomagnetic storm), the two ends in the same hemisphere, both less than 9° (1,000 km) equatorward of the auroral oval or past it. The oval comes down to 56.5° geomagnetic at Kp 5 and to 48.5° at Kp 9 |
| TEP | Across the geomagnetic equator, the two ends about as far from it (within 15°, each at least 5° away), 3,000 to 9,000 km on 6 m, 3,000 to 6,000 on 2 m, crossing it within 30° of north-south (TEP: off north-south, in Settings; measured at the midpoint, against the geomagnetic meridian: JA–VK crosses at 17°, LU–YV at 8°), and Kp 4 or less (a storm puts TEP out) |
| Evening TEP | A TEP path between 19:00 and 01:00 local solar time over its midpoint (6 m and 2 m) |
| Afternoon TEP | A TEP path between 14:00 and 19:00 local solar time over its midpoint (6 m only: it doesn't reach 144 MHz) |
| Es | 6 m, 700 to 2,300 km (one hop) |
| Multi-hop Es | 6 m, beyond 2,300 km |
| F2 | 6 m beyond 2,300 km, with the SSN at 100 or more (VOACAP's: KC2G's or NOAA's) and the Sun up over the path's midpoint |
| Tropo | 6 m under 700 km; 2 m under 1,300 km or beyond 2,400 |
| Es or tropo | 2 m, 1,300 to 2,400 km: either |
| Meteor scatter | MSK144 or FSK441 (with Meteor scatter on) |

The geomagnetic equator is a centred dipole's: over South America the dip equator is up to some
5° off it, less than TEP's own width.

The Kp is NOAA SWPC's, the estimated planetary one minute by minute, downloaded every 15 minutes
with the A index (the last 24 hours), the solar flux (SFI), the sunspot number (SN) and NOAA's
storm scales (G geomagnetic, R radio blackout, S solar radiation). The header's **propagation pill**
shows SFI, SN, A and K and then NOAA's three storm scales —**G**, **R** and **S**—, which are the ones
that light up when something happens: at 0 they stay grey, at 1 or 2 they turn amber and from 3 up red,
and the pill goes red (the dot too) when G is 1 or more; an R or an S shows in its number alone. Hovering it opens a
**card** with the last days as charts —the SFI of four days, the SN of ten, the A and the Kp of the
last 24 hours, each in its own colour, its name written in it— and, under the charts, today's forecast with the chance of a
radio blackout, plus two tables: the **scales**, with what each one is —G, geomagnetic storms, which
light up the auroras; R, radio blackouts caused by an X-ray solar flare; S, radiation storms, with
today's chance of reaching S1 or more— and each one's level now; and the **thresholds**, with the
ideal and the critical value of SFI, K and A (SFI 100 or more, well ionised, under 70 poor on the high
bands; K up to 2, quiet, 5 or more a storm; A under 10, steady, over 20 unsettled). The line on top,
with how old each value is and what the A and K mean in words, turns **green** when every index is
inside the good range and no scale is on. The Kp line is drawn in red when those 24 hours had a storm.
A **click** on the pill pins the card, with a blue border, to read it or copy the numbers without
losing it to the mouse; another click on the pill, a click elsewhere or Escape closes it. The **VHF**
pill's tip shows them too. Without them (no download yet) no path is aurora and TEP doesn't look at
Kp.

**On the map** (both projections), with the **50-144 MHz** filter picked or the **VHF** pill on at the top
(only VHF shown, as the 2 m tropo forecast; without either they would cover the DX map), each opening in the list draws its paths (the latest 20) in the colour of what it probably is, and where they bounce: by Es, a circle at each hop's middle (a
hop is up to 2,300 km, so a 5,000 km path bounces three times), the bigger the more paths through
it; by TEP or F2, at the path's midpoint. Those bounces are grouped into clouds, not averaged: with
one cloud north and one south, their mean would fall between them, where there is nothing. Point
your antenna at the cloud, not at the country. Tropo draws a wide corridor along its paths instead.
They fade as their row does and leave the map with it. Another feed's pill (the cluster's, the
RBN's) hides the openings, in the list too: they aren't its spots.

Three more, under **Also**, each turned on by itself:

- **Meteor scatter**: MSK144 and FSK441 reports never count for an opening (a meteor's trail is
  there for a second, whatever the band does). With it on they make openings of their own, 500 to
  2,200 km (what a trail at the bottom of the E layer reaches), for 3 minutes, and within two days
  of a meteor shower's peak (Quadrantids, Lyrids, Eta Aquariids, Arietids, Southern Delta
  Aquariids, Perseids, Orionids, Leonids, Geminids, Ursids) the **VHF** pill shows a blinking
  **☄ MS** and its tip names it, with the peak's day and hour. The peak is worked out from the
  Sun's longitude, IMO's for each shower, so it is right every year with nothing to update.
- **10 m short skip: 6 m may open**: stations near you hearing 10 m stations 250 to 830 km away,
  strong (−10 dB or more), as many as an opening asks. A hop that short needs a dense Es cloud: by
  the secant law (f = foEs · sec i, the E layer at 110 km, with the Earth's curve) 28 MHz at 830 km
  needs foEs 8 MHz, at 420 km 13. 6 m opens at about 9.2 MHz (one hop's longest, 2,300 km, is
  about 5.4 times foEs), so from 8 MHz it is close. The alert is a **50 MHz** one, its row the 10 m
  station heard: "10 m short skip at 470 km: foEs 12.2 MHz, Es MUF 66 MHz, 6 m may open". Under
  250 km 10 m is ground wave and tropo between neighbours; F2 backscatter at those distances is
  weak, and the −10 dB leaves it out. When an ionosonde within 500 km of you measures an foEs of
  8 MHz or more, the same row says it too — the cloud measured by the ionosonde, not only by the
  stations — and the VHF pill's tooltip says it even with no opening yet: "6 m by Es: foEs 9.1 MHz
  at La Plata, 57 km away, 5 min ago (La Plata (KC2G, GIRO))".
- **2 m tropo from the weather forecast**: a duct before the band is heard. Once an hour,
  Open-Meteo's forecast for your QTH and 24 points around it (8 bearings at 200, 400 and 600 km),
  at the ground and at each pressure level from 1000 to 800 hPa (temperature, humidity, height).
  From them the air's refractivity N = 77.6 / T · (P + 4810 e / T) (ITU-R P.453), and how fast it
  falls with height, layer by layer: 157 N/km or more is a duct (2 m bends down faster than the
  Earth curves and goes hundreds of km along it), 79 to 157 super-refraction (longer paths than
  usual). A duct over you, or at two points of one bearing, is told once when it starts: the
  console, a Windows pop-up and the dashboard's sound, "2m: a tropo duct toward NE, E (−190 N/km
  at 300 m)". The **VHF** pill shows **≋ TROPO** while it lasts, and its tip says where, or when
  one is expected in the next 12 hours. A duct at one point of a bearing only is a possible one:
  **≋ TROPO?** in yellow, and a notice in the dashboard, without the sound or the pop-up. One only
  in the layer against the ground, 200 m thick or less (over the sea in the afternoon), is a
  surface duct: too thin to hold 2 m, and the model's least sure layer, so it is shown and never
  told. With the **VHF** pill on (a click on it: only VHF shown), the map shows the points (a duct
  strong, super-refraction faint, a surface duct a ring), and a dashed line from your QTH to each
  duct with where it is ("E 400 km"). It can't see a duct
  thinner than the levels' spacing (some 250 m near the ground), nor whether one goes on along the
  whole path. Weather data by Open-Meteo.com (free for
  non-commercial use, CC BY 4.0). It doesn't need the stations near you: it works on its own.

Every number is a setting. Fewer false alarms, not none: a busted FT8 decode can repeat, and with
few stations near you an opening may go unseen.

### Ventanas: when a country you miss is heard

Knowing that TI is still missing on 15 m CW is easy; knowing **at what time and on which band** it
is really there is not. **Settings → Ventanas** counts it: every spot of a station in a country you
miss — the RBN's, the cluster's, PSKReporter's, and your WSJTX's own decodes — that was heard by a
station within **Near you** of your grid square (1500 km, the alerts' own distance, or its own)
goes into a bucket: the country, the band, the mode group, and the UTC hour and month it was heard
at, with how far away the station that heard it was. The same station on the same band by the same
spotter counts once every 10 minutes (the RBN repeats it every few seconds), stations in your own
country don't count, and the hours are kept 24 months.

What counts is **on how many days** a country was heard in each hour, not how many spots: ten
skimmers hearing it at once, or a contest weekend full of spots, are still one day. And it is read
for this time of year — this month and the one either side — since the hours a band opens move
with the seasons: last June says little about December.

The **Ventanas** tab lists what you still need, **one row per country**, with its Club Log Most Wanted
rank and its 24 hours as a line of bars, all its bands together. **Order** offers **A–Z** (the default),
**Most Wanted** (the lowest rank first, unranked countries last) and **This hour** (the countries most
often heard at this UTC hour first). For Most Wanted, ties and unranked countries are alphabetical;
the browser remembers your choice. A dash means no rank is available. If no ranks have loaded, the
list says so: check that Club Log is enabled in Settings → DXpeditions or wait for it to load.
Countries with a spot in the visible list in the last 15 minutes are green and have a dot. The mark
updates as spots arrive, filters change, or the spot expires; the bars still show history, not live activity.
Click a country and it shows every band and mode it was heard on
near you, hour by hour — solid where it was heard, with who heard it and how far, and faint where it
wasn't: those hours are VOACAP's own prediction, the same as the Station tab's.
**All** shows every country, worked or not, to plan rather than to chase.

At the top of each UTC hour, **The hour's alert** puts one row in the list — **ITS HOUR** — with the
countries you miss that are usually heard right now (heard in that hour on at least two days, and
within 45 days), the next few named in it. It's the answer to "what should I be listening for at this
time", and it doesn't pop up unless you leave that on. Only the bands and modes you miss: a country you
have confirmed on 20 m FT8 doesn't show for 20 m FT8, however well it's heard. DX Agent opened again
within the hour puts that hour's row back in the list.

A DXpedition that has just started has no hours counted yet: VP2M heard near you at 23 UTC doesn't
show at 00 UTC, though it is still on the air. That's what **Also by VOACAP** is for (Settings →
Ventanas, off out of the box): it adds the countries you miss heard near you in the last 2 hours, on
a band and mode you miss, when VOACAP gives that band open now with at least the chance you pick
(70 % out of the box; FT8's for the digital modes). It's a prediction, not heard at that hour, and the
row says so: "its hour by VOACAP: 100% now · heard near you at 23:17 UTC, 849 km". As many countries
at most as the heard ones, besides them. It needs the sunspot number, the Station tab's.

Nothing extra has to be downloaded: it is built from the spots DX Agent already reads. Where you have
no log yet it counts every country; the more the log says, the better it knows what you miss.

### Busted RBN calls

An RBN skimmer sometimes decodes a call wrong: P9DX, F6A for F6ABW. One like that is heard by that
skimmer only, while a real station is soon heard by several, or spotted on the cluster. So, with
**RBN alerts: wait for a second skimmer** (Settings → Alerts, on by default, `alerts.rbn_confirm`),
a station one RBN skimmer only heard alerts once a second skimmer, or a cluster spotter or a
PSKReporter receiver, hears it on that band within 10 minutes (usually a minute or two). Cluster
spots, posted by people, alert at once; a skimmer's spot the cluster passes on (spotter `K9LC-#`) is
that skimmer's, and waits too. An active DXpedition's call (on the DXpeditions list) alerts at
once: a busted call that is exactly that one is unlikely, and the DXpeditions tab already says
it's on the air. With it off, they alert at once, and the call is marked
with an amber **?** until someone else hears it.

### Repeat alerts (cooldown)

The same alert isn't repeated within the cooldown (default 15 minutes):

- **Country alerts** (ATNO, NEW BAND, NEW MODE, NEW SLOT) are limited per
  country + band + mode. One US station on 30 m CW is enough; you won't get an alert
  for every other US station on 30 m CW for the next 15 minutes.
- **Call alerts** (DXPEDITION, WATCHLIST, NEW CALL, YOU'RE HEARD, ITS HOUR) are limited per
  call + band + mode, so the DXpedition alerts again when it moves to another band or mode.
- **NEW GRID** is limited per grid square + band: one station in FN31 on 6 m is enough.
- **NEW PREFIX** is limited per prefix + band: one HG19 station on 20 m is enough.
- **MARATHON** is limited per country + band + mode, and the CQ zone per zone + band + mode.

An alert with several reasons keeps quiet only while all of them are within the cooldown: a NEW
BAND that is also WATCHLIST alerts again for the call even though the country already alerted.
**Clear list** forgets what alerted: what is still on the air alerts again at its next spot.

Saving Settings keeps the cooldown, and so does closing and opening DX Agent again: what alerted in
the last cooldown minutes is listed again as it is spotted, but doesn't pop up or beep a second time.

### How DX Agent decides to alert

This section's diagrams are in the
[user manual](https://github.com/lw5hr/dx-agent-download/blob/main/MANUAL.en.md#how-dx-agent-decides-to-alert).

There are two sets of filters. DX Agent's decide whether a spot **is** an alert: if it doesn't
pass them, there is no row, no console line and no pop-up. The dashboard's only decide which
alerts are **seen** in the list and on the map. That is why the Windows pop-up doesn't depend on
the dashboard's filters, and the sound and the notice at the top right do: the dashboard only
sounds or shows a notice for an alert that passes its filters.

**The gates, in order.** Every spot from the cluster, the RBN or your WSJT-X, with its mode, band
and country worked out, goes through these questions. At the first one it doesn't pass, there is
no alert:

1. **Is it your own call?** (`alerts.self_spots`): it is **YOU'RE HEARD**, on any band and mode,
   skipping the next gates but the last.
2. **Is it a beacon?** It is dropped.
3. **Is the band one of your bands?** (`alerts.bands`)
4. **Is the mode one of your modes?** (`alerts.modes`)
5. **Is it on Ignore?** (`alerts.ignore`, `*` works)
6. **Is the spotter on your continents?** (`cluster.spotter_continents`, `rbn.spotter_continents`,
   each feed its own)
7. **What do you need?** Against the active callsign's log, worked and confirmed (see Alert
   types). A DXpedition you already have confirmed only goes on with `dxpeditions.show_have`.
8. **Is it ticked in Alert me for?** (`alerts.alert_on`), plus the Marathon's reasons while you
   follow it (`marathon.alert_countries`, `alert_zones`).
9. **Did more than one skimmer hear it?** (`alerts.rbn_confirm`): heard by one only, it waits for
   another, or someone on the cluster or PSKReporter, within 10 minutes (see Busted RBN calls).
   Off, it passes marked **?**.
10. **Is it heard near you?** (`alerts.near_only`, `near_km`): heard only far away, it is held. On
    digital, with PSKReporter live, it alerts as soon as a receiver near you reports it; otherwise
    with the next spot from someone near you.
11. **Did it alert within the cooldown?** (`alerts.cooldown_minutes`, see Repeat alerts)

What passes them all is an alert: the console, a Windows pop-up when its priority is within
`alerts.notify_max_priority` and `alerts.desktop` is on, `data/dxagent.db`, the panadapter with
`rig.tci_spots`, and the dashboard. **ITS HOUR** (`[windows]`) and the VHF openings (`[vhf]`)
don't go through these gates: each has rules of its own. PSKReporter makes no alerts by itself: it
confirms what a skimmer heard and tells whether a station is heard near you.

**The dashboard's filters** (band, mode, alert type, search, Only *call*, continent, activity, Hide
confirmed, Near you only, Only LoTW and the feeds' pills) all apply at once, to the list and the
map. They delete nothing: what they hide shows as soon as the filter changes. YOU'RE HEARD and the
openings aren't filtered by continent, confirmed, near you or LoTW; YOU'RE HEARD also passes any
pill, and the openings only VHF's. The openings' paths are drawn on the map with the **50-144 MHz**
filter or the **VHF** pill on. `alerts.latest_only` and `alerts.expire_minutes` only change the list.

---

## 6. The configuration file

Everything on the Settings page is stored in `config.toml` in your DX Agent folder (see
[Quick start](#1-quick-start); **Settings** shows its exact path).
You can also edit it by hand; restart `run` afterwards.

| Section     | Setting                     | Default                                           | What it does |
|-------------|-----------------------------|---------------------------------------------------|--------------|
| (top)       | `data_dir`                  | `data` (default)                                  | Where downloads, the alert history and the saved LoTW password are stored |
| station     | `callsign`                  | (your call)                                       | Used to log in to the cluster and RBN |
| station     | `log_source`                | `adif`                                            | `adif` = a file from your logger; `lotw` = every QSO you uploaded to LoTW (no ADIF file); `new` = a new log DX Agent keeps, `data/<CALL>.adi` (starting from scratch); `logbook` = DX Agent's logbook, `data/log-<CALL>.db` (experimental) |
| station     | `adif`                      | `C:/Users/you/AppData/Roaming/Log4OM2/backup/CALL_*_backup.adi` | Path or glob of your log. With a glob the newest file is used. A list of paths also works |
| station     | `grid`                      | empty (= taken from the log)                      | Your grid square, for "near you" |
| station     | `others`                    | `[]`                                              | Your other callsigns, each with its log: `[{call = "N1CALL", adif = ["C:/…/N1CALL.SQLite"]}]` (see Several callsigns) |
| station     | `active`                    | empty (= all your callsigns)                      | The callsign alerts, DXCC and WAZ follow; set by the header's picker |
| alerts      | `alert_on`                  | `atno, dxpedition, new_band, new_mode, watchlist` | Which alert types fire |
| alerts      | `call_scope`                | `band_mode`                                       | For DXpedition and watchlist calls: `call` = any QSO counts, `band` = per band, `band_mode` = per band and mode |
| alerts      | `bands`                     | 160m–6m (no 60m)                                  | Spots on other bands are ignored |
| alerts      | `modes`                     | `CW, PHONE, DIGI`                                 | Mode groups to alert on |
| alerts      | `watchlist`                 | empty                                             | Calls to always look for; wildcards allowed, e.g. `"VP8*"` |
| alerts      | `ignore`                    | empty                                             | Calls never to alert on; wildcards allowed |
| alerts      | `cooldown_minutes`          | `15`                                              | Minimum time before repeating the same alert |
| alerts      | `desktop`                   | `true`                                            | Windows pop-up notifications (built into Windows 10/11) |
| alerts      | `notify_max_priority`       | `1`                                               | Pop-ups for: 1 = ATNO only; 3 = also new mode and watchlist |
| alerts      | `near_km`                   | `1500`                                            | "Near you" = heard by a station within this many km |
| alerts      | `near_only`                 | `false`                                           | Only alert when the station is heard near you |
| alerts      | `rbn_confirm`               | `true`                                            | An RBN spot alerts once a second skimmer, or a cluster or PSKReporter spot, hears the station (a busted call doesn't alert) |
| alerts      | `latest_only`               | `false`                                           | Dashboard list: keep only the latest row of each station on the same band and mode, within 3 kHz |
| alerts      | `self_spots`                | `true`                                            | List the spots of your own callsign (YOU'RE HEARD): who hears you, and how far away |
| alerts      | `expire_minutes`            | `0`                                               | Dashboard list: take out stations not spotted on that band and mode for this many minutes (0 = never) |
| alerts      | `keep_days`                 | `7`                                               | Days of alerts kept in `data/dxagent.db` (0 = none). With RBN on, about 25,000 alerts a day, some 15 MB |
| ui          | `enabled`                   | `true`                                            | Start the web dashboard with `run` |
| ui          | `port`                      | `8073`                                            | Dashboard address: `http://localhost:8073` |
| ui          | `open_browser`              | `true`                                            | Open the dashboard automatically when `run` starts |
| ui          | `check_updates`             | `true`                                            | Say on the dashboard (a pill next to the version) when a newer DX Agent is out: asks GitHub every hour for the latest release of the download repository. Nothing of yours is sent, nothing is installed |
| ui          | `filters`                   | `["continent", "near", "hide_confirmed", "lotw", "activity"]` | The filters shown above the alert list (a hidden one is off); the dashboard's ⚙ next to Clear filters saves it too |
| ui          | `hidden_types`              | `[]`                                              | Alert types whose filter doesn't show (they still alert), by their name in English: `ATNO`, `NEW BAND`... `SELF`, `OPEN` (50-144 MHz); the dashboard's ⚙ at the end of the alert types saves it too |
| logbook     | `reload_seconds`            | `60`                                              | How often to check the ADIF file for changes |
| logbook     | `live`                      | `true`                                            | Also read the QSOs Log4OM 2 saved since its last backup, every 10 seconds, from its database |
| logbook     | `udp_port`                  | `12065`                                           | QSOs your logger sends over UDP as you log them (N1MM, DXLog.net, Log4OM, WSJT-X; see "Your QSOs as you log them"); 0 = off |
| logbook     | `udp_group`                 | `""`                                              | A multicast group to join on that port (WSJT-X's UDP Server, e.g. `239.255.0.1`) |
| logbook     | `backup_folder`             | `""`                                              | Where the logbook's backups go (a OneDrive, Google Drive or Dropbox folder to have them in the cloud); empty = `data/backups` |
| logbook     | `backup_hours`              | `24`                                              | A backup of each callsign's logbook every so many hours; 0 = only before an import |
| logbook     | `backup_keep`               | `10`                                              | How many backups of each callsign's logbook are kept (the oldest are deleted) |
| dxpeditions | `refresh_hours`             | `6`                                               | How often to re-read the DXpedition sources |
| dxpeditions | `sources`                   | `["ng3k", "425dxn", "clublog"]`         | Where to find DXpeditions: NG3K ADXO, 425 DX News, Club Log |
| dxpeditions | `show_have`                 | `true`                                            | Show DXPED HAVE lines (grey, no pop-up) |
| lotw        | `enabled`                   | `true`                                            | Download your LoTW confirmations |
| lotw        | `username`                  | empty (= your call)                               | LoTW login (empty = your call) |
| lotw        | `password_env`              | `LOTW_PASSWORD`                                   | Name of an environment variable to read the password from (optional, see LoTW) |
| lotw        | `refresh_hours`             | `12`                                              | How often to download new confirmations |
| cluster     | `enabled`                   | `true`                                            | Use the DX cluster |
| cluster     | `hosts`                     | `w3lpl.net:7373`, `dxspider.co.uk:7300`, `dx.k3lr.com:23` | DX clusters, tried in order. If one fails, sends nothing for 5 minutes or sends no spot for 10 (a session the server stopped serving), the next is used. The RBN too |
| cluster     | `commands`                  | empty                                             | Sent after login, e.g. `["set/ft8"]` |
| cluster     | `history_minutes`           | `30`                                              | On connecting, ask the cluster for its latest spots (`sh/dx 100`) and keep those from the last N minutes; `0` = off |
| cluster     | `spotter_continents`        | empty (all)                                       | Only use spots from spotters on these continents |
| rbn         | `enabled`                   | `true`                                            | Use the Reverse Beacon Network |
| rbn         | `cw` / `digital`            | `true` / `true`                                   | CW+RTTY feed (port 7000) and FT8/FT4 feed (port 7001) |
| rbn         | `spotter_continents`        | `SA, NA`                                          | Only alert when a skimmer on these continents hears the station |
| rig         | `target`                    | `none`                                            | Tune button: `none`, `log4om`, `n1mm`, `dxlog`, `omnirig`, `hamlib`, `flrig`, `dxlab` or `tci` |
| rig         | `host` / `port`             | `127.0.0.1` / `0`                                 | Where that program listens; 0 = its default port |
| rig         | `set_mode`                  | `true`                                            | Also set the mode (CW, USB/LSB, data/RTTY) |
| rig         | `omnirig_rig`               | `1`                                               | OmniRig radio 1 or 2 |
| rig         | `name`                      | `""`                                              | What the dashboard calls the radio (empty: as OmniRig or the TCI program does) |
| rig         | `wsjtx`                     | `false`                                           | Tune on an FT8/FT4 spot also puts the call in WSJT-X |
| rig         | `split`, `split_cw_khz`, `split_ssb_khz` | `true`, `1`, `5`                     | Split when the spot says where the station listens; kHz up for a bare "UP" on CW/RTTY and on phone |
| rig         | `tci_spots`, `tci_keep_worked`, `tci_tx_guard` | `true`, `false`, `block`            | With TCI: the alerts on the panadapter, the ones you work stay in grey, and what a Tune does while the radio transmits (`block` or `wait`) |
| rig, rig2   | `rigctld`                   | `false`                                           | With Hamlib: DX Agent runs `rigctld` itself, and stops it when it stops |
| rig, rig2   | `rigctld_path` / `rigctld_args` | `""` / `""`                                   | The program (empty: the `rigctld` in PATH) and what it is given, e.g. `-m 3078 -r COM3 -s 19200`; the port is `port` |
| rig2        | `name`, `target`, `host`, `port`, `set_mode`, `omnirig_rig`, `rigctld`, `rigctld_path`, `rigctld_args` | as `[rig]`, `2` for `omnirig_rig` | A second radio, as `[rig]` (`none`: just the one); only one of the two on `tci` |
| marathon    | `enabled`                   | `false`                                           | Follow the CQ DX Marathon (a Marathon tab and MARATHON alerts) |
| marathon    | `event`                     | `year`                                            | `year` (January 1 to December 31) or `sprint` |
| marathon    | `sprint_start` / `sprint_end` | `2026-10-17` / `2026-10-26`                     | The Sprint's first and last day (UTC) |
| marathon    | `category`                  | `all`                                             | Modes that count: `all`, `CW`, `PHONE`, `DIGI` or `classic` (CW and phone) |
| marathon    | `alert_countries` / `alert_zones` | `true` / `true`                             | Alert on a country / a CQ zone not worked yet in the Marathon |
| marathon    | `calls`                     | `[]` (= your main callsign)                       | Your callsigns whose QSOs count, at most 2 |
| vhf         | `near` / `self`             | `false` / `false`                                 | VHF openings: the stations near you hearing far ones / the stations hearing you (see VHF openings) |
| vhf         | `bands`                     | `["6m", "2m"]`                                  | The bands watched |
| vhf         | `radius_km`                 | `200`                                             | near: how far from you a station is near |
| vhf         | `stations` / `senders`      | `3` / `2`                                         | Different stations that must hear it / (near) different stations they must hear there |
| vhf         | `group`                     | `dxcc`                                            | What a place is: `dxcc`, `continent` or `field` |
| vhf         | `min_km_6m` / `min_km_2m`   | `800` / `300`                                     | Only stations at least this far apart count (km) |
| vhf         | `ttl_6m` / `ttl_2m`         | `10` / `5`                                        | Minutes a report counts; an opening closes after this long with none |
| vhf         | `no_eme` / `notify`         | `true` / `true`                                   | Leave out the moonbounce modes / a Windows pop-up when the band opens |
| vhf         | `grace_min`                 | `10`                                              | An opening back within this many minutes after it closed is the same one: no new alert |
| vhf         | `ms` / `short_skip`         | `false` / `false`                                 | Meteor scatter's own openings and the showers' peaks / 10 m short skip near you: 6 m may open |
| vhf         | `tep_angle`                 | `30`                                              | TEP label: how far off north-south a path may cross the geomagnetic equator, in degrees (90: any) |
| vhf         | `tropo_wx`                  | `false`                                           | 2 m tropo ducts from Open-Meteo's weather forecast, around you, before the band is heard |
| windows     | `enabled`                   | `true`                                            | Count, and show, the 24 hours each country you miss is heard at (the Ventanas tab) |
| windows     | `near_km`                   | `0`                                               | Heard by a station within this many km of you; 0 = `alerts.near_km` |
| windows     | `approx` / `skip_home`      | `true` / `true`                                   | Count a spotter placed at its country's centre / leave out the stations in your own country |
| windows     | `dedupe_min`                | `10`                                              | Minutes the same station on the same band by the same spotter counts once |
| windows     | `keep_months`               | `24`                                              | Months a country's hours are kept (0 = for good) |
| windows     | `alert`                     | `true`                                            | The `ITS HOUR` row at the top of each UTC hour: the countries you miss that are usually heard now |
| windows     | `alert_min` / `alert_max`   | `2` / `1`                                         | Heard in the hour on at least this many days / at most this many countries in the row (the next few named) |
| windows     | `fresh_days` / `notify`     | `45` / `true`                                     | Only if it was heard within these days / a Windows pop-up for it |
| windows     | `voacap` / `voacap_pct`     | `false` / `70`                                    | Also those heard near you in the last 2 hours, when VOACAP gives the band open now / with at least this % |
| scp         | `enabled`                   | `true`                                            | Super Check Partial: suggest calls in the QSO forms as you type |
| scp         | `spotted` / `log` / `master` | `true` / `true` / `true`                         | Suggest the calls spotted lately / in your log / in MASTER.SCP (without it, not downloaded) |
| scp         | `modes`                     | `CW, PHONE, DIGI`                                 | The mode groups whose spots count as on the air |
| scp         | `minutes` / `freq_khz`      | `15` / `3`                                        | A spot this many minutes old or less: on the air / "on your frequency": within this many kHz |
| scp         | `max_spotted`               | `5`                                               | At most this many spotted stations among the suggestions (1 to 12), the one on your frequency first |
| scp         | `tab` / `near`              | `true` / `true`                                   | Tab completes the station on your frequency / show "Did you mean" |

The LoTW password is never stored in this file (see below).

### Tuning tips

- **Too many alerts.** On bands where your log has few countries, NEW BAND fires
  often. Keep only **ATNO** and **DXpedition**
  ticked, or untick bands you don't operate.
- **Only stations you can probably hear.** Under **Only skimmers in**, select only
  your own continent. That is a better sign the path to you is open, but where
  skimmers are few you will miss some spots.
- **Hide DXpeditions you already have.** Untick **Still show them**.
- **Chase specific stations.** Add them to the **Watchlist**, e.g. `3Y0K` or `VP8*`.
- **Repeat alerts sooner or later.** Change **Don't repeat for**.

### Several callsigns

Add your other callsigns (a contest call, say) in Settings → Station → **Your other
callsigns**, each with its own log: an ADIF file (`*` picks the newest), or Log4OM's
database itself (`.SQLite`, e.g. `C:/Users/you/Log4OM/N1CALL.SQLite`: nothing to export).
Then:

- **Alerts, DXCC and WAZ count all your callsigns together**: a country worked with any of
  them is worked, a QSO confirmed with any of them is confirmed. The header's callsign
  becomes a picker: **All** (the default), or one callsign alone, to see what that one still
  needs. The choice applies at once and is kept for the next start.
- **The CQ DX Marathon** counts the callsigns you tick in its card, at most 2: the rules allow
  two in one entry, used from the same location.
- **Which QSO is whose:** each log's QSOs are its callsign's. A QSO whose `STATION_CALLSIGN`
  is another of your calls goes to that one (a logger with every call in one log works too).
  QSOs logged over UDP or in Log4OM's database go to the call they say (WSJT-X, N1MM and
  Log4OM say it), else to your main callsign.
- **LoTW:** one LoTW account with every callsign's certificate is enough: the confirmations are
  downloaded with the callsign each QSO was made with, and each callsign takes its own. A
  confirmations file from before this version is downloaded again once, in the background
  (the old one is used meanwhile).
- Your own spots, from any of your callsigns, never alert. The cluster and RBN log in with
  your main callsign; **Are you in their log?** asks Club Log for every callsign (with All)
  or for the one picked.
- **Which log you see:** the Log view shows the header callsign's (with **All**, all of them
  together, newest first). Its **Log** filter, in the side panel, has a chip per callsign to see just
  one without touching the header (nor the alerts, DXCC or WAZ); with no chip picked it follows the
  header. **Export ADIF** exports what you see. The console's **Latest QSOs** flap shows the log of the
  form's **Station**, the one you are logging into.

### A new log (starting from scratch)

With no log yet, choose Settings → Station → **Your log** → **Start from scratch (a new log)**.
DX Agent creates an empty ADIF log, `data/<CALL>.adi` (a call with a `/` gets `_`), and uses
it: at first every station counts as new. It never overwrites one that's already there.

The QSOs your programs send over UDP as you log them (WSJT-X, N1MM Logger+, DXLog.net,
Log4OM...: see "Your QSOs as you log them") are written to it, once each, so the log grows by
itself. Nothing else writes to it, and DX Agent never writes to your logger's file. It's a
normal ADIF file: when you start using a logger, import it there and choose **ADIF file**.

### DX Agent's logbook (experimental)

DX Agent can keep your log itself: Settings → Station → **Your log** → **DX Agent's logbook
(experimental)** (`log_source = "logbook"`). Its options are then in their own tab, Settings →
**Log**, shown only with the logbook (as the Actions tab and the Log view). Each of your callsigns has its own logbook,
`data/log-<CALL>.db` (SQLite), with every field of every QSO, `APP_*` and your own fields
included: nothing a logger wrote is lost. The callsigns' logbooks never mix (each will upload
as its callsign); alerts, DXCC and WAZ still count them together, as with several logs.
**Your other callsigns** then need no file: each has its logbook.

- **Import** your logger's ADIF once (Settings → Log → **Import ADIF…**, or **Import QSOs…** in the Log view, which imports into the callsign the log shows or, with All, the one picked in its menu; choosing the callsign with
  more than one): the file is only read, a QSO already there is skipped, and it is all or
  nothing (one transaction). Only that callsign's QSOs go in: one made as another callsign
  (`STATION_CALLSIGN`) stays out and is counted, with a note to import the file into that
  callsign's logbook. A log of 50,000 QSOs takes 15 to 30 seconds.
- **New QSOs** come in over UDP as before (WSJT-X, N1MM, Log4OM...), each into the logbook
  of the callsign it says, and from the **console** under the list, the map and the Log view, so the
  spots stay in sight as you log: the radios along its top, under them one line with the call, kHz,
  band, mode, the reports and **Log QSO**, and the WinKey's messages in a column at its right. In
  the Log view, where there is room to spare, the radio keeps its whole window instead of the strip:
  a column at the console's left, the frequency large, each VFO or slice a line under it, two radios
  side by side; the form beside it (on a narrower screen, under it and the WinKey).
  **Log a QSO**, at its top left, folds it to the radios alone, in any view, so the list gets the
  room (the WinKey's keys still send); a click opens it again. **Show details** opens your
  callsign, the date and time, name, QTH, grid square, references and comment (the browser remembers
  whether you left the console and the details open; editing a QSO opens both). On a narrower
  screen the fields and the WinKey's column get narrower and **Show details** is its arrow alone. It fills itself
  when you pick a station in the list or on the map (the call, its grid square, the park or summit);
  the other way round, a call typed in by hand fills the side panel's **Station** tab as if you had
  picked it in the list (the tab you have open stays open, and what you typed stays), and
  beside **Call** it says its country, in red for an ATNO, after a green ✓ when the DX Marathon's
  list vouches for the call that day or a red ✗ when it calls it a bad spot or an invalid operation
  (the note in the tooltip). Tab goes Call → RST sent → RST received → **Log QSO** (Shift+Tab back;
  the other boxes keep the page's order, and in the call box Super Check Partial's ghost takes Tab
  first). The form comes with the
  frequency and mode the radio is on as it moves (read through OmniRig, Hamlib, flrig or TCI: `rig.target =
  "omnirig"`, `"hamlib"`, `"flrig"` or `"tci"`; on TCI the slice Tune moves, or the split one; without it, the
  spot's). A station picked away from where the radio is (more than 3 kHz: FT8's offset doesn't
  count) puts the spot's frequency and mode in the form until the
  radio moves (Tune, a click on the list's frequency, the dial): from then on they are the
  radio's. In split, when TX frequency is known, the QSO is logged where you transmitted (`FREQ`)
  and where you received (`FREQ_RX`). If the TX frequency is unknown, the form asks you to enter
  it before saving. Along the console's top, the radio as AetherSDR shows a slice: the VFO it follows
  in a tile of its own, its frequency large, with its letter in its colour (A cyan, B magenta, C green,
  D yellow), **TX** on the one it transmits on (filled red while it does), **SPLIT**, its band and mode;
  beside it the radio's other VFO, or AetherSDR's other slices, a tile each (more than fit wrap to a line below) (OmniRig's VFO B when the radio's file
  reads it; on Thetis or ExpertSDR each receiver's A and B). On TCI and Hamlib, the S-meter too, as the
  program says it: a bar beside the frequency with its reading (S7, S9+20), green up to S9 and
  red over it, and a small one on each of the other tiles (OmniRig doesn't read it). Hamlib
  reads only the current VFO and never switches VFOs just to poll; the other line shows its
  last observed frequency, which may be stale. The display says when split TX is unknown and
  shows **PTT?** when the transmit state is unknown. **A click on the other VFO's tile puts the
  radio on it** through Hamlib, OmniRig, or flrig (with its guard on) where supported, after checking PTT. **The band and
  mode lists** also check PTT: a band returns to its last frequency and mode
  (`data/radio-bands.json`), or an appropriate default; a mode keeps the frequency. Typing in the frequency or the mode stops following the
  radio until the next station. The date and time follow the clock (in blue) until you type
  them, so the QSO is logged at the time you save it; **Now** follows the clock again. A call
  typed in: once you stop typing, its station shows in the side panel's **Actions** tab, under the
  filters (callbook, worked grid, earlier QSOs) and what
  DX Agent filled for the one before (name, QTH, grid square, references) goes; what you typed
  stays. **Esc** in the call takes it out, and what DX Agent filled for that station with it.
  **Log QSO**, there or in the Station tab, saves
  it, and says what it adds to your log ("new for you: new band"), as your log was before it. Logged,
  the form is empty for the next one, the cursor back in the call: the call, the reports
  (back to the mode's, 599 or 59) and the time (on the clock again); the frequency and the mode
  stay. **Last QSO:**, at the end of the form's line, says the one you just logged; its **✎** opens it in
  the form to correct it, wherever you are. In the list and on the map, above **Log a QSO**, the
  **Latest QSOs** flap unfolds the latest QSOs of the log you are logging into (with several callsigns,
  the form's **Station**: pick another and it shows that one's) (five by default; the selector beside it picks how
  many, up to eight), each with its **✎** (open it in the form) and its **✕** (delete it, with the same
  question the Log view asks); the browser remembers whether you left it open, and how many you picked. Its right half, **With**, shows your
  QSOs with the form's station, newest first (as many as the selector says; **and N more** opens the Log view
  with all that callsign's QSOs, no filters): on top how
  many QSOs and how many confirmed, and the bands you worked it on (solid the confirmed ones); each QSO with its
  reports, where it's confirmed (**LoTW**, paper **QSL**, **eQSL**: green confirmed, dashed sent) and its **✎**. A
  station you never worked says **New**. With a narrow console the two halves stack. Every QSO gets what a logger adds: DXCC, country, CQ and ITU zones, continent
  (cty.csv), your grid square and callsign.
- **Super Check Partial**, in the console's form: as you type the call, the calls that match show
  above it, over the list's last rows, with no window of their own. Those on the air come first: the one
  spotted on the form's frequency (within 3 kHz, with a green dot), then those on that band, then those
  on other bands, all spotted in the last 15 minutes (cluster, RBN or WSJT-X). Then those in your log,
  marked **worked** (on the air too), and last MASTER.SCP's, marked **SCP** (on the air too); those in
  both have both marks. Each has on its left the colour of what it adds on that band and mode, as in
  the list (an ATNO in red). With the call empty it shows **On your frequency:** the station spotted
  where the radio is. When only one there starts with what you typed, the rest of it shows faint in the
  box and **Tab** completes it. **Alt+1** to **Alt+9** pick the others, and a click does too. A `?` stands
  for any one character (`9X?KM`). When someone on that band is one character off what you typed
  (`9X5KN` with `9X5KM` spotted), **Did you mean** shows. It asks only about a whole call you typed:
  not one picked from the list or the map, not while what you type still goes on into other calls, not
  when what you typed is itself spotted on that band; a call that exists (in MASTER.SCP or your log) only
  gets it for a station one character off on your frequency. When what you typed is nowhere, it says so:
  "not seen: not on the air, in your log or in Super Check Partial". A whole call that exists (in
  MASTER.SCP, in your log or spotted, as `K1TTT`) turns green in the box. MASTER.SCP
  (https://www.supercheckpartial.com/, the file contest loggers use) is downloaded to `data/MASTER.SCP`
  and again once it is a month old, only with DX Agent's logbook (`log_source = "logbook"`). Without it
  the suggestions from the air and your log go on. **Settings → Log → Super Check Partial** picks
  what it suggests: **Spotted**, **Worked before** (your log) and **Super Check Partial** (only the SCP:
  untick the other two), the modes whose spots count as on the air (without **Digital**, FT8 and FT4
  don't fill the list), how many minutes a spot counts as on the air (15), how close is "on your
  frequency" (± 3 kHz), how many spotted stations it shows at most (5, so the list doesn't get long:
  the one on your frequency first), and whether **Tab** completes and **Did you mean** shows. It also says how
  many calls the file has, its release and when it was downloaded, and **Update now** downloads it
  again at once. Off, the forms suggest nothing and the file isn't downloaded. **Esc** in the call or
  **Alt+W** in the form (N1MM's wipe) clear the call and what was filled for its station. **Ctrl+W** too, where the browser lets it through: Chrome and Edge keep it to close the tab
  and don't let a page have it. So with a call typed by hand and not saved, the browser asks before
  the page is closed or reloaded.
- **The Log view**, next to List and Map: your log, with the console under it as under the list
  (while it shows, the **List** button counts the spots the list takes, in the colour of the most
  wanted, until you're back), newest first, 100 at a time, searched
  by call (with All, every callsign's); the alerts' filters aren't shown there: the log's are,
  in the side panel's **Actions** tab, one under another under FILTERS — **Band** (those in your log),
  **Mode** (CW, Phone, Digital, FT8, FT4, RTTY), **Country & date** (a part of its name as the log writes it, or a prefix: `LU`, `VP8`, `3Y`, `LU5`, by the QSO's DXCC as cty.csv has it; and from and to dates), and
  **Confirmations** (LoTW: confirmed, the last download, uploaded not confirmed,
  not uploaded; Club Log: uploaded, to upload again, rejected, not uploaded; QSL card:
  received, sent not received, none: `QSL_RCVD` and `QSL_SENT`, unless their `_VIA` says `E`,
  electronic). They are buttons like the list's, grouped under their name (BAND, MODE, COUNTRY, DATE, LOTW, CLUB LOG, QSL CARD): a click picks a choice, another click on it takes it off; each says how many QSOs it would show with the search and the other filters as they are (with 20m picked, the modes say how many on 20m), and a strip of icons at the tab's right goes to each part (the uploads, Band, Mode, Country & date, Confirmations, the station), a dot on those with a filter on. Your log is kept in memory and brought up to date with only what changed, so filtering and sorting don't read it all again. They work with the search and the sort; the one in use stands out, **Clear
  filters** takes them off, and they aren't kept on a reload. A click on a
  column's header sorts the whole log by it (again: the other way; a third time: newest first
  again); QSOs without a value there go last, and the order is remembered. Each upload or
  download shows in a box above the log while it runs (its step, a moving bar, how long so
  far), then green or red with how it went: green goes by itself after a minute (not while the
  pointer is on it: some seconds after it leaves), red stays until you close it; and the log's LoTW and CL
  columns show what it marked. **A click on the row** opens it where it is, over the row, with the
  form's fields to correct it right there and **Delete**, with no trip to the console and no tab
  change (Enter saves; Escape or a click outside leaves it as it was). What the log lacks of the name,
  QTH or grid square comes from the call's callbook (QRZ.com, HamQTH…), marked, and is saved only with
  **Save changes**; change the call and what it filled for the one before goes, the new one asked. **✎** edits a
  QSO in the console's form, its details open (**Save changes**; **Cancel** leaves it as it was): only what the
  form shows changes, every other field stays, and what it was is kept in the logbook (table
  `edited`). Changing the call, time, band or mode of a QSO already uploaded marks it to
  upload again (Club Log and QRZ.com: `M`; LoTW: `N`, LoTW takes it as a new QSO and the old
  one stays there). **✕** deletes a QSO once you confirm: it is kept aside in the logbook
  (table `deleted`), and it isn't deleted from LoTW, QRZ.com or Club Log.
- The upload and download buttons, with **Import QSOs…**, in the side panel's **Actions** tab (Upload and download), show only for what is set up: **Upload to LoTW** with TQSL installed, **Download from LoTW** with LoTW's username and password, **Upload to Club Log** with your Club Log email and application password, **Upload to QRZ** and **Download from QRZ** with the QRZ.com Logbook API key. When the page can't read their state (the log busy with an import), it asks again a few seconds later.
- **Upload to LoTW**, in the side panel's Actions tab, with how many QSOs aren't there yet
  (`LOTW_QSL_SENT` isn't `Y`): DX Agent writes them to a file and runs **TQSL** on it
  (`tqsl -q -d -u -a compliant -l <location>`), which signs them with your callsign
  certificate and uploads them; those TQSL uploaded before are skipped. Once TQSL says LoTW
  has them they are marked `LOTW_QSL_SENT = Y` with the date. TQSL must be installed, with
  your certificate and a Station Location for each callsign: Settings → Log → **Station
  Location** (automatic: the only one TQSL has for that callsign; with two or more, choose).
  TQSL keeps your certificate's passphrase; DX Agent never sees it.
- **Download from LoTW:** your new LoTW confirmations now (what LoTW received since the last
  download), each marked on its QSO (`LOTW_QSL_RCVD = Y`, `LOTW_QSLRDATE`): the QSO with the
  same call, minute and band in the logbook of the callsign it was made as. Under how it went,
  **Confirmed:** the stations (call, band and mode, by call and then band; the first 40, and how many more), and **Show
  them in the log** leaves in the Log view every QSO it confirmed (the LoTW → last download
  filter; each logbook remembers them, so it holds after a restart, and a download with nothing
  new doesn't change it). Needs LoTW on, with its password (Settings → LoTW).
- **Upload to Club Log**, with how many QSOs aren't there yet (`CLUBLOG_QSO_UPLOAD_STATUS`
  isn't `Y`): each callsign's QSOs to that callsign's log in your Club Log account, with your
  Club Log email and an **application password** (Club Log → Settings → App Passwords; not
  your Club Log password), in Settings → Log; the password is stored encrypted in
  `data/clublog.secret`. One QSO goes with Club Log's realtime.php, several in one
  putlogs.php. Club Log gave DX Agent its API key on terms DX Agent keeps: only when you
  press the button, one request at a time and at most one a minute (a second callsign waits
  its minute); a QSO Club Log rejects is marked rejected (**✗** in the CL column, with its
  reason) and isn't sent again until you edit it; a login Club Log refuses stops every upload
  until you change the email or password; nothing is queried or downloaded with the key.
  The key is never in the source code: the packages carry it compiled; running from source,
  put your own application key in `data/clublog-app.key`. Club Log has no confirmations to
  download.
- **Upload to QRZ** and **Download from QRZ**, with how many QSOs aren't in your QRZ.com
  logbook yet (`QRZCOM_QSO_UPLOAD_STATUS` isn't `Y`). QRZ takes an **API key per logbook**
  (QRZ → Logbook → API key, in the form `ABCD-0A0B-1C1D-2E2F`; the dashes may be left out) —
  no user name nor password: you enter it in Settings → Log, one per callsign, and it's kept
  encrypted in `data/qrzlog-<CALL>.secret` (never in `config.toml`, never in the source code,
  and sent only to logbook.qrz.com). **Upload to QRZ** sends the QSOs that are missing one by
  one (INSERT, a second apart: the first upload of a big log takes a while), each marked
  `QRZCOM_QSO_UPLOAD_STATUS = Y` with the date and QRZ's `logid` (`APP_QRZLOG_LOGID`); one QRZ
  refuses (a date outside the logbook's range, say) is marked with its reason and isn't sent
  again until you edit it. **Download from QRZ** brings what changed in QRZ since the last
  download, in pages of 250, and marks each QSO (`QRZCOM_QSO_DOWNLOAD_STATUS`, the date and the
  `logid`; `QSL_RCVD` on the ones QRZ has confirmed). Both need an **active QRZ subscription**
  (XML Logbook Data or higher) on that callsign's account: without it the API answers that the
  key isn't authorized and DX Agent stops that callsign (the button says why) until you change
  the key. **Test** in Settings → Log makes one request (`STATUS`, it changes nothing) and says
  whether the key works.
- Uploads and downloads run in the background, each in its box under the buttons. Before an
  upload DX Agent says how many QSOs of each callsign will go.
- **A station clicked in the Log view** opens in the Actions tab, not the Station tab (the
  console's form stays as it is): under the filters, the QSO you clicked with an **Edit this QSO** button, what
  your callbooks say about the station, the bands and modes you worked and confirmed it on (the
  Station tab's grid, with its card on each cell) and your QSOs with it. The station in the form
  shows there the same way, without the name, QTH and grid square already in the form: only the
  callbook they came from (and QSL via, LoTW and eQSL when it says).
- **Callbooks** (Settings → Log): a station's name, QTH and grid square from **QRZ.com**,
  **HamQTH** or **QRZCQ**, each with your own account there; the usernames go in
  `config.toml` (`[callbook]`), the passwords encrypted in `data/qrz.secret`,
  `data/hamqth.secret` and `data/qrzcq.secret`. QRZ.com's full data needs its XML Logbook
  Data subscription (without it, a few fields: DX Agent says "limited data"); QRZCQ's API
  needs a Premium account; HamQTH's is free. They're asked in that order, or with the one in
  **Ask first** before the others (HamQTH, say, without a QRZ.com subscription:
  `first = "hamqth"` in `[callbook]`), and the first that knows the call answers; what its answer lacks (no QTH or grid square from QRZ.com without
  its subscription) the next ones fill in. They are asked when you pick a station or click it in the Log view, once per call
  while DX Agent runs (kept in memory, never on disk). Its name, QTH and grid square fill
  the form's empty ones (a spot's 4-character grid square becomes the callbook's 6 when they
  agree); the box says which callbook it came from. Editing a QSO too: only its empty fields,
  highlighted and named, kept when you Save changes. A session is reused until the service
  ends it, then one login again; a login a callbook refuses isn't tried again until you
  change that username or password.
- **Backups:** the whole logbook as ADIF, zipped, in `data/backups/log-<CALL>-<date>.zip`:
  once a day, before each import and before moving QSOs; the last 10 are kept. Restoring one
  is importing it. Settings → Log → Backups sets the **folder** (**Browse…**, or the
  **OneDrive**, **Google Drive**, **Dropbox** buttons shown when they're on the PC: a "DX Agent"
  folder in it), **how many hours** apart (0 = only before an import) and **how many to keep**
  per callsign. To have them in the cloud, a OneDrive, Google Drive or Dropbox folder: its
  program uploads what goes there (DX Agent connects to no service). A new folder gets a backup
  within minutes; if it can't be written (the drive isn't there), the backup goes to
  `data/backups`. **Back up now** makes one of each callsign in the folder saved.
- **CW with WinKey** (Settings → Radio → **CW with WinKey**, off by default): a K1EL WinKeyer (WK2 or
  WK3) on a serial port keys the radio in CW. In the console, in a column at its right, a button per
  message: out of the box **CQ** (`CQ DE {MYCALL} K`), **5NN** (`{CALL} 5NN`), **TU** and
  **73**, on **F1** to **F4**.
  `{MYCALL}` is the callsign you work as, the form's, and `{CALL}` the station in the form; a message
  with `{CALL}` and no call in the form isn't sent. Each message's key sends it, in the list, the map
  or the Log view, also while typing in the form, and **Stop**, or **Esc** in the console or while
  something goes out, cuts at once what it is sending and what waits. Under the buttons, the message
  going out shows, its call filled in ("9X5KM 5NN"): each character lights up as the
  WinKey keys it (its echo on the serial port), and once it ends it stays a moment and goes. A WinKey
  that doesn't echo shows the whole message, gone after the time it takes at its speed. **The speed**
  changes right there: **−** and **+** beside the WPM take it down or up by 1, and **PgDn** and **PgUp**
  with the cursor in the form by 2, as in N1MM. The WinKey takes it at once, also in the middle of a
  message, and `config.toml` keeps it (`cw.wpm`) with nothing restarted. The messages are
  edited there (up to 12, each a name, a text and a key: **F1** to **F10** or none, each key on one
  message only; a new one takes the first free), with the port and the speed (5 to 60 WPM); **Test** opens the port and says the WinKey's firmware. Only what CW has is sent: letters,
  figures and `/ ? . , = + -`. The port opens with the first message and stays open (opening it can
  reset a WinKey) until Settings are saved or DX Agent closes, which give it back to its paddle. In
  `config.toml`: `[cw]` (`enabled`, `port`, `wpm`, `messages`, `esm`).
- **ESM** (*Enter Sends Message*, as in N1MM; off by default): turned on and off with the **ESM**
  button in the WinKey's column, beside the WPM (`config.toml` keeps it, `cw.esm`, with nothing
  restarted, and every open dashboard follows), in Settings → Radio → **CW with WinKey**, or by typing
  **ESMON** or **ESMOF** in the call box and **Enter** (the box is emptied). On, **Enter** in the form
  does what comes next for the box the cursor is in: with no call it sends **CQ** (the message on
  **F1**); with a call, the report (the one on **F2**, out of the box `{CALL} 5NN`), and the cursor goes
  to **RST received**, with the mode's 599 selected (in a contest the report is always that one;
  another is typed over it): there, with it emptied, **Enter** sends **?** so they say it again, the
  cursor staying; with a report in it, **Enter** (or **F3** from anywhere, with a call in) saves the QSO as **Log QSO** does (the same fields and checks) and only
  then sends TU (the one on **F3**): the form is empty and the cursor on the call for the next one, not
  waiting for the CW to end. If the QSO can't be saved, no TU goes out and the error is the usual one;
  if the report didn't go out (no WinKey), the cursor stays. Beside the button it says what Enter will do in the box you're in ("↵ CQ",
  "↵ 5NN", "↵ ?", "↵ TU + log"). Editing a QSO of the log, Enter saves as always, and with ESM off nothing changes. The
  texts are the messages on **F1**, **F2** and **F3**: to turn it on there must be a message on each.
- **QSY from the call box**, as in N1MM: a frequency in kHz typed in the call box and **Enter**
  (`14025`, `7012.5`, `3525,2`) tunes the active radio there, in the mode it is in, and empties the
  box; nothing is saved or sent, ESM on or off.
- While the logbook is experimental, keep a copy of your log elsewhere too.

### Your QSOs as you log them

DX Agent reads your log file (the ADIF backup) at start and whenever it changes. A logger
that tells it each QSO as you save it keeps it current in between: a station you just worked
stops alerting at once, the alerts already listed say what they need now, and the
DXpeditions, activations and the map's slots refresh. The QSOs go on top of the file until
the next backup has them. Those that came over UDP are also kept in `data/dxagent.db`, so
closing DX Agent before your logger writes its file doesn't lose them: at the next start
they count again, and each one goes once the log read again has it (at most 2,000, for 30
days).

**Log4OM 2** needs nothing: DX Agent reads the QSOs since the backup straight from Log4OM's
database, every 10 seconds (`logbook.live`).

**Over UDP** (`logbook.udp_port`, 12065 by default, on 127.0.0.1; changed in Settings → **UDP
port for logged QSOs**, with the multicast group next to it): one port takes N1MM's contact XML,
ADIF text and WSJT-X's messages. It isn't the dashboard's port (8073) nor the radio's. In the logger, add `127.0.0.1` port `12065` as a
destination, next to the ones you already have:

| Logger | Where | Tested |
|--------|-------|--------|
| **N1MM Logger+** | Config → Configure Ports… → **Broadcast Data**: tick **Contacts**, add `127.0.0.1:12065` to the addresses | its documented format |
| **DXLog.net** | Options → Configure network: QSO broadcast `127.0.0.1:12065` (up to three, separated by spaces); Options → Broadcast: QSO, and **Use N1MM QSO format** | its format (as N1MM's) |
| **Log4OM 2** (without the database) | Settings → Software integration → Connections → UDP outbound, type **ADIF_MESSAGE**, `127.0.0.1` port `12065` | ADIF format |
| **WSJT-X / JTDX** | For their QSOs, usually not needed: your logger gets them and tells DX Agent. Needed for what they decode (see "What your WSJT-X decodes"), or if they log on their own: Settings → Reporting → UDP Server. A multicast group (`239.255.0.1`, port `2237`) lets DX Agent (`udp_group = "239.255.0.1"`, `udp_port = 2237`) and a program that joins groups (GridTracker, JTAlert) hear it at once; a plain address goes to one program only | both of their logged-QSO messages (Logged ADIF and QSO Logged) |
| **HRD Logbook** | Tools → Configure → QSO Forwarding → **UDP Send**: `127.0.0.1`, port `12065` | not tested: HRD doesn't say its format; it works if it sends ADIF or N1MM's XML |

Without UDP (DXKeeper, Logger32, N3FJP, others): a logger that writes an ADIF file as it
goes, or exports one automatically, can be added as a second log file in Settings, next
to the backup; WSJT-X's own `wsjtx_log.adi` is one. UDP has no delivery check: a lost
packet only waits for the next backup.

### What your WSJT-X decodes

If WSJT-X (or JTDX) sends its messages to DX Agent, each station it decodes is one more spot,
like a cluster or RBN one: it alerts even if no one spotted it, when it's something you want
(a new country, a new band, your watchlist...). It counts as heard **0 km from you**, at the
grid square WSJT-X says: for "near you", its filter and **Only alert when heard near you**, a
station your radio decodes is always near. Doubtful decodes (those WSJT-X marks `?`), decodes
from a `.wav` file and the ones WSJT-X sends again (Replay) don't count. The frequency is the
dial plus the audio offset.

It comes on the same port as the QSOs (`logbook.udp_port`). WSJT-X sends to one UDP server, and
if another program already uses it (Log4OM, JTAlert, GridTracker):

- **a multicast group**: in WSJT-X, Settings → Reporting → UDP Server `239.255.0.1`, port
  `2237`; in DX Agent, `udp_group = "239.255.0.1"` and `udp_port = 2237`. DX Agent and the
  programs that join groups (GridTracker, JTAlert) hear it at once;
- or **the program that gets it forwards it** to `127.0.0.1:12065` (JTAlert and GridTracker
  can resend WSJT-X's messages).

A **WSJT-X** pill next to the feeds shows the decodes received, and in the list the row says
who heard it: your call, the SNR and the message (WSJT-X).

The station you call in WSJT-X (a double click on its decode, or typed in DX Call) opens in the
Station tab, as a click on it in the list: what you have of its country, the path, VOACAP...
Its row comes into sight in the list (flashing), and the map goes to it when it was out of sight,
around a halo (see World map). Once each time DX Call changes, so you can look at another
station meanwhile.

---

## 7. LoTW integration

LoTW is used in two ways.

### Who uploads to LoTW (public, no login)

ARRL publishes the last upload date of about 236,000 callsigns. DX Agent downloads
that list once a day and adds the station's status to each alert:

| Shown             | Meaning |
|-------------------|---------|
| `LoTW 2026-09-22` | The station uploads to LoTW; this is its last upload |
| `LoTW announced`  | No uploads yet, but the DXpedition listing says QSL via LoTW. New DXpedition calls often upload only after the trip |
| `no LoTW`         | Not a LoTW user and no LoTW announced — a confirmation will need a paper QSL or OQRS |

### LoTW as your log (no ADIF file)

If you don't have an ADIF file (or your logger can't export one), DX Agent can use
LoTW itself as your log: Settings → Station → **Your log** → **LoTW only (no ADIF
file)**, then fill in your LoTW username and password in the LoTW section and click
**Save and apply**.

- It downloads every QSO you uploaded to LoTW, confirmed or not, into
  `data/lotw_log.adi`. The first time it asks LoTW for one year at a time (one query for
  a big log can keep LoTW busy so long that the connection drops), with a progress bar
  on the dashboard. If LoTW is busy or doesn't answer, it tries again by itself every 10
  minutes and continues from the last finished year. After that it only asks for QSOs
  uploaded since the last download, every time it checks LoTW (12 hours by default).
- The confirmations download works the same way, in the background: the agent starts
  watching spots meanwhile.
- Confirmations come from the same download plus the normal confirmations download.
- Your grid square for "near you" is taken from the QSOs (MY_GRIDSQUARE), unless you
  set it in Settings.
- **Limit:** only what you uploaded to LoTW counts. A QSO you logged but never
  uploaded looks "not worked".

### Your confirmations (needs your LoTW password)

DX Agent downloads your confirmed QSLs from LoTW every 12 hours and merges them into
the log index. That keeps "confirmed" current even when Log4OM hasn't synced with
LoTW. The first download fetches everything and can take a few minutes; later ones
only fetch QSLs received since the last download.

**To turn it on:** Settings → LoTW → tick **Download my LoTW confirmations**, type
your LoTW website password, click **Test login**, then **Save and apply**.

Where the password lives:

- It is encrypted with Windows' own protection for your user account (DPAPI) and
  stored in `data/lotw.secret`. Only your Windows account on this PC can decrypt it.
  It is never written to `config.toml`, so the config file is safe to share.
- Alternatively you can set an environment variable once in PowerShell and open a new
  terminal: `setx LOTW_PASSWORD "your-lotw-website-password"`. If both exist, the
  environment variable wins, and the Settings page says so.

What happens without it, or with a wrong one:

- Without a password, DX Agent uses the confirmations already in your ADIF file and
  prints `no LoTW password set` at start.
- With a wrong password, **Test login** says `LoTW rejected this username or password`;
  while running it prints `LoTW did not return ADIF - check username / password` and
  falls back the same way.

### What counts as confirmed

A QSO is confirmed when `LOTW_QSL_RCVD` or `QSL_RCVD` is `Y` or `V` in the log, or
when it comes from the LoTW download. eQSL doesn't count, matching DXCC rules.

---

## 8. How it works

```text
 DX cluster (telnet, w3lpl.net:7373) ─────┐
 RBN CW     (telnet.reversebeacon.net:7000)┼──> parse "DX de ..." line
 RBN FT8/FT4 (telnet.reversebeacon.net:7001)┘          │
                                                       v
                                  band + mode (RBN, comment, or band plan)
                                                       │
                                                       v
                    filters: beacons, own call, bands, modes, ignore list,
                             spotter continent
                                                       │
                                                       v
                         callsign ──> DXCC country (cty.csv)
                                                       │
                                                       v
   ADIF log + LoTW QSLs ──> worked / confirmed index ──> compare ──> reasons
   NG3K/425/Club Log ────> active DXpeditions ───────┘      │
                                                            v
                                         filter by alert_on, cooldown
                                                            │
                                                            v
              web dashboard + console line + pop-up + data/dxagent.db
```

### Step by step

1. **Feeds.** Three telnet connections run at the same time: the DX cluster, RBN CW
   and RBN FT8/FT4. Each one answers the login prompt with your callsign (or sends it
   after 10 s if no prompt is recognised). If a connection drops, or a server sends
   nothing for 5 minutes, it moves to the next host in the list; once every host has
   failed it waits longer between tries, up to 5 minutes.
   **Recent spots:** right after logging in to the cluster, the agent sends `sh/dx 100`
   (DXSpider and AR-Cluster answer with their last ~100 spots, about the last 30
   minutes) and processes those from the last `history_minutes`, oldest first, so the
   list isn't empty at the start. They alert with their own time, never pop up or
   beep, and a spot already seen is not repeated after a reconnect. The RBN doesn't
   answer `sh/dx`, so it starts empty.
2. **Parsing.** Every `DX de SPOTTER: FREQ CALL comment TIME` line becomes a spot.
   Skimmer suffixes like `-#` are removed from the spotter's call.
3. **Band and mode.** The band comes from the frequency. The mode comes from RBN
   (it reports CW, RTTY, FT8, FT4), else from the cluster comment (`cw`, `ssb`,
   `ft8`...), else from what RBN reported for that call within 2 kHz in the last 30
   minutes, else from the frequency: FT8/FT4 frequencies (14074, 10136...) are FT8/FT4,
   the CW and phone parts of the band plan are CW and SSB. Only a spot in a part used by
   several modes (the digital part, 160m and 6m phone) is shown with `?`. Modes are grouped like DXCC:
   **CW**, **PHONE** (SSB, AM, FM) and **DIGI** (FT8, FT4, RTTY, PSK, MFSK...).
4. **Filters.** Beacons, your own call, bands and modes you don't want, calls in
   `ignore`, and (if set) spotters outside your chosen continents are dropped.
5. **Country lookup.** The call is matched to a DXCC entity with AD1C's `cty.csv`:
   exact calls first, then the longest matching prefix. Portable calls such as
   `TF/PD9DX` or `W9HT/VP9` use the location prefix; `/P`, `/M` and `/QRP` are
   ignored; `/MM` and `/AM` have no country.
6. **Your log.** The ADIF file is read into sets of what you have: countries,
   country+band, country+mode, country+band+mode, and calls — each one both
   "worked" and "confirmed". For logged QSOs the ADIF `DXCC` field is used when
   present. The file is checked every 60 seconds and re-read when it changes (about
   3 seconds for 49,000 QSOs). LoTW confirmations are merged in the same way.
7. **Comparison.** The spot is checked against those sets to find the reasons
   (ATNO, new band, new mode, new slot, DXpedition, watchlist, new call). For
   DXpeditions it also works out what working it would add, including confirmations.
8. **Alert.** Reasons not in `alert_on` are dropped, the cooldown is applied, and the
   alert is shown on the dashboard, printed and saved.

When you save settings, the agent stops the feeds, reloads the configuration, the log
and LoTW, and starts the feeds again. The dashboard and the alerts already on screen
stay.

### Data sources

| Source | Used for | Address |
|--------|----------|---------|
| DX cluster (W3LPL, with DXSpider UK and K3LR as fallbacks) | Human spots | `w3lpl.net:7373`, `dxspider.co.uk:7300`, `dx.k3lr.com:23` |
| Reverse Beacon Network | Skimmer spots, CW/RTTY and FT8/FT4 | `telnet.reversebeacon.net:7000` and `:7001` |
| AD1C country files | Callsign → DXCC country | https://www.country-files.com/ |
| Super Check Partial | Calls suggested in the QSO forms | https://www.supercheckpartial.com/ |
| NG3K ADXO calendar | Announced DXpeditions | https://www.ng3k.com/Misc/adxo.html |
| 425 DX News calendar | Announced DXpeditions | https://www.425dxn.org/index.php?op=wcal |
| Club Log | DXpeditions uploading now, their logs and OQRS, DXCC Most Wanted | https://clublog.org/expeditions.php |
| ARRL LoTW user activity | Who uploads to LoTW | https://lotw.arrl.org/lotw-user-activity.csv |
| ARRL LoTW report | Your confirmations | https://lotw.arrl.org/lotwuser/lotwreport.adi |
| RBN skimmer list | Where each skimmer is (grid square) | https://www.reversebeacon.net/nodes/ |
| PSKReporter | Who received a station on FT8/FT4 (on request only) | https://pskreporter.info/ |
| PSKReporter live (MQTT) | The same reports as they arrive, for the stations followed (PSKReporter → Live); and for VHF openings, the receivers around you and your own calls on 6 m and 2 m | https://mqtt.pskreporter.info/ |
| POTA, WWFF spots | Who is activating a park now (every 2 minutes) | https://api.pota.app/spot/activator, https://spots.wwff.co/static/spots.json |
| Natural Earth (world-atlas) | Coasts and country borders for the map | https://www.naturalearthdata.com/ |
| GridTracker DXCC map shapes | DXCC entities, DXCC-only borders and CQ zones for the map | https://gitlab.com/gridtracker.org/gridtracker2 |
| NOAA SWPC | The predicted sunspot number (VOACAP); the planetary Kp, A, solar flux, sunspot number and the G/R/S storm scales (the propagation pill and the VHF openings) | https://services.swpc.noaa.gov/ |
| Open-Meteo | The weather forecast for 2 m tropo ducts (free for non-commercial use, CC BY 4.0) | https://open-meteo.com/ |

### Updates

Once an hour (`ui.check_updates`, on by default) DX Agent asks the public download repository on
GitHub which release is the latest, and keeps the answer in `data/update.json`. When there is a
newer one and the release brings this system's package (`dx-agent-<version>-windows.zip`,
`-linux-x86_64.tar.gz` or `-macos.tar.gz`) beside its `SHA256SUMS` and the signature on it
(`SHA256SUMS.sig`), DX Agent installs it by itself:

1. Downloads the package into your DX Agent folder (`data/update/`) and checks that `SHA256SUMS` is
   signed with **DX Agent's release key** (Ed25519, its public half pinned in
   `dxagent/selfupdate.py`), then checks the package's SHA-256 against that file. A package that
   doesn't match, or a release signed with any other key, is deleted — never used.
2. Unpacks it and tries it: the Python the package brings has to import the new program.
3. Writes a small script and stops. The script waits for the process to end, copies the new files
   over the program's folder (never `data/`, `config.toml` or your `DX Agent.lnk`), keeps a backup
   in `data/update/before-<version>/`, and starts DX Agent again.

Your settings and data live in a folder of their own (see above), so only the program is replaced.
Nothing is installed where that isn't safe: a git checkout or a copy started with your own Python
(nothing of its own to replace) only gets the notice on the dashboard, and so does a release
without `SHA256SUMS` and its signature. A version that failed here is not tried again for six
hours, and `DXAGENT_NO_AUTO_UPDATE=1` in the environment turns the installation off (the notice
stays). What the script does goes to `data/update/update.log`; if it ever leaves a program that
won't start, the backup it made is one folder away.

**Releasing** (the maintainer's side): `tools/make_package.py` writes `dist/SHA256SUMS`, and signs
it when the private half of the key is in `data/release-key.txt` (made once with
`python tools/sign_release.py keygen`, which prints the public half to paste in
`dxagent/selfupdate.py`; `$DXAGENT_RELEASE_KEY` with the seed in hex works instead, for a machine
that only signs). Attach `SHA256SUMS` and `SHA256SUMS.sig` to the release beside the packages, and
run `python tools/sign_release.py verify` first: it checks them exactly as an installed DX Agent
will. That private half is the whole trust in the automatic updates — back it up, and keep it out
of git and out of the packages. Losing it means publishing a new key in a new release and having
users install that one by hand (the copies they have only trust the old key).

---

## 9. Project files and data cache

The code is in `dxagent/`, one module per job. `config.toml`, `config.toml.bak` and `data/`
are in your DX Agent folder, not the program's ([Quick start](#1-quick-start)). Everything
downloaded goes to `data/` and can be deleted at any time; it is downloaded again when needed.

| File                        | Job |
|-----------------------------|-----|
| `config.toml`               | Your settings (written by the Settings page; personal, never shared) |
| `config.example.toml`       | The starting settings for a new installation |
| `start-dx-agent.bat`        | Double-click to start DX Agent on Windows, without a window |
| `start-dx-agent-console.bat` | The same, in a console window that shows everything it prints |
| `create-shortcut.bat`       | Windows draws a `.bat` with cmd's icon: this makes `DX Agent.lnk`, the same launcher with DX Agent's logo (`dxagent/static/logo.ico`) |
| `start-dx-agent.sh`         | The same two launchers for Linux and macOS (`-console.sh` shows what it prints); they use the package's Python if it brings one (`python/`, or on a Mac `python-arm64/` / `python-x86_64/`) |
| `start-dx-agent.command`    | macOS: double-click in Finder to start it; takes the folder out of quarantine so the bundled Python can run |
| `tools/make_package.py`     | Builds the packages to share: the Windows zip and the Linux and macOS tarballs (Python included, program compiled), plus the source zip with `--source`, and `SHA256SUMS` with its signature (`SHA256SUMS.sig`) — what DX Agent checks its own updates against; never your personal data |
| `tools/make_icon.py`        | Draws `dxagent/static/logo.ico` at each size from the SVG logos (Edge or Chrome does the drawing); only when the logo changes |
| `tools/sign_release.py`     | The release key: `keygen` makes it once (`data/release-key.txt`, never in git), `sign` writes `dist/SHA256SUMS.sig`, `verify` checks it as an installed DX Agent will |
| `tools/make-shortcut.ps1`   | What `create-shortcut.bat` runs: the `DX Agent.lnk` pointing at the launcher, with the icon |
| `config.toml.bak`           | The previous settings, kept on every save |
| `README.md`                 | Short overview |
| `DOCUMENTATION.md`          | This guide |
| `DOCUMENTACION.md`          | This guide in Spanish |
| `dxagent/__main__.py`       | Command line: `run`, `dxpeditions`, `check`, `stats` |
| `dxagent/agent.py`          | Main loop: starts the feeds, filters spots, reloads the log, refreshes DXpeditions and LoTW, applies saved settings |
| `dxagent/config.py`         | Reads `config.toml` with defaults; validates and writes it for the Settings page |
| `dxagent/home.py`           | Where your settings and data live (your DX Agent folder); copies them there from an older version's folder on the first start |
| `dxagent/credentials.py`    | Stores the LoTW password encrypted for your Windows user (on Linux and a Mac, readable only by you) |
| `dxagent/telnet.py`         | Connects to the cluster and RBN, logs in, reconnects |
| `dxagent/spots.py`          | Parses `DX de ...` lines into call, frequency, band, mode, SNR, WPM |
| `dxagent/bands.py`          | Band from frequency, mode groups, band-plan mode guess |
| `dxagent/cty.py`            | Callsign → DXCC country, using `cty.csv` |
| `dxagent/adif.py`           | Reads ADIF files, including UTF-8 names |
| `dxagent/logbook.py`        | Builds the worked and confirmed index from the log and LoTW |
| `dxagent/matcher.py`        | Decides the alert reasons and what a DXpedition would add |
| `dxagent/dxpeditions.py`    | Reads and merges the NG3K, 425 DX News and Club Log DXpedition lists |
| `dxagent/lotw.py`           | LoTW user list, login test and confirmation download |
| `dxagent/alerts.py`         | Console line, colours, pop-up, cooldown, alert history |
| `dxagent/queries.py`        | Station grid, DXpedition list and DXCC standing, shared by the commands and the dashboard |
| `dxagent/reach.py`          | "Near you": who heard each station and how far from you; RBN skimmer list; PSKReporter |
| `dxagent/windows.py`        | Ventanas: when each country you miss is heard from near you, an hour and a month a bucket, and the hour's alert |
| `dxagent/pskmqtt.py`        | PSKReporter live: an MQTT client for mqtt.pskreporter.info, and the stations followed |
| `dxagent/refinfo.py`        | A POTA park's or SOTA summit's page, for the Station tab |
| `dxagent/geo.py`            | Grid squares and distances |
| `dxagent/onlinelog.py`      | Checks a DXpedition's log on Club Log |
| `dxagent/wsjtx.py`          | Sends a call to WSJT-X (UDP Configure message) |
| `dxagent/activities.py`    | Activations (POTA, SOTA, IOTA...) found in the spots' comments |
| `dxagent/hunting.py`       | Summits, parks, islands... you have worked, band by band |
| `dxagent/livelog.py`       | The QSOs Log4OM saved since its last backup, from its database |
| `dxagent/udplog.py`        | QSOs other programs send over UDP as they log them (N1MM / DXLog.net XML, ADIF, WSJT-X), and what WSJT-X decodes |
| `dxagent/qsolog.py`        | DX Agent's logbook (experimental): one SQLite file per callsign, import, backups |
| `dxagent/qsoentry.py`      | A QSO typed in on the console's form as ADIF, an edit of one, and what a logger adds to a QSO (DXCC, zones...) |
| `dxagent/tqsl.py`          | Uploads to LoTW through TQSL: finds it, its Station Locations, signs and uploads |
| `dxagent/clublog.py`       | Uploads to Club Log (realtime.php, putlogs.php), one request a minute at most |
| `dxagent/callbook.py`      | A station's name, QTH and grid square from QRZ.com, HamQTH or QRZCQ (your accounts) |
| `dxagent/store.py`         | `data/dxagent.db` (SQLite): DX Agent's own records |
| `dxagent/worldmap.py`       | Land, DXCC borders and DXCC entities for the map view |
| `dxagent/marathon.py`       | CQ DX Marathon: which QSOs count, the countries and zones worked in the period, what a spot would add |
| `dxagent/rig.py`            | Tune: talks to Log4OM, N1MM, DXLog.net, OmniRig, Hamlib, flrig or DXLab; reads the radio's frequency and mode through OmniRig, Hamlib or flrig |
| `dxagent/tci.py`            | TCI (AetherSDR, ExpertSDR, Thetis): tunes the radio and keeps the alerts on its panadapter |
| `dxagent/web.py`            | Dashboard web server: page, JSON API, live event stream, settings |
| `dxagent/static/index.html` | The dashboard and Settings page (HTML, CSS and JavaScript in one file) |
| `dxagent/static/logo.svg`  | The DX Agent logo (dashboard header) |
| `dxagent/static/logo-small.svg` | The same logo cut down to what reads at 16 px: the browser tab icon |
| `dxagent/static/logo.ico`  | The same logo as a Windows icon (16 to 256 px): what the launcher's shortcut shows |
| `tests/test_dxagent.py`     | 361 unit tests (`python -m unittest tests.test_dxagent`) |
| `tests/test_filters.js`     | The alert list's filters, every combination (run by the tests above when Node.js is installed) |

| Data file                                     | Source             | Refreshed      |
|-----------------------------------------------|--------------------|----------------|
| `data/cty.csv`                                | country-files.com  | daily (checked every 6 hours, also while DX Agent runs) |
| `data/MASTER.SCP`                             | supercheckpartial.com | monthly, with DX Agent's logbook |
| `data/dxped-ng3k.json`, `dxped-425dxn.json`, `dxped-clublog.json` | NG3K, 425 DX News, Club Log | every 6 hours |
| `data/clublog-mostwanted.json`                | Club Log Most Wanted | daily        |
| `data/lotw-user-activity.csv`                 | ARRL LoTW          | daily          |
| `data/lotw_qsls.adi` + `data/lotw_state.json` | your LoTW account  | every 12 hours |
| `data/log-<CALL>.db`, `data/backups/`         | DX Agent's logbook (experimental) | as you log; a backup a day |
| `data/lotw.secret`                            | Settings page      | when you save a password |
| `data/rigctld-<n>.json`                       | DX Agent: the rigctld it runs for radio 1 or 2 (its process id), so a start finds it again instead of starting a second one | while that rigctld runs |
| `data/rbn-skimmers.json`                      | RBN skimmer list   | daily          |
| `data/sota-summits.csv`                       | SOTA summits list  | monthly        |
| `data/pota-parks.csv`                         | POTA parks list (the References tab) | monthly        |
| `data/world-countries-50m.json`               | Natural Earth (via world-atlas) | once |
| `data/dxcc-shapes.json`, `data/cq-zones.json` | GridTracker                     | once |
| `data/world-map.json`                         | made from the two above (the finished map) | when they change |
| `data/dxagent.db`                             | DX Agent: alerts (last `keep_days` days), where activators were (last 32 days), your QSOs with them, QSOs over UDP not in your log yet, and the hours each country you miss is heard at (Ventanas, `windows.keep_months`) | while it runs |
| `data/cache/log-<CALL>.pickle`                | DX Agent: each callsign's log indexes as last read, so a big log isn't read again at each start. Used only when the log files, the country file, your callsigns, the year and DX Agent's version are all the same; the QSOs since (your logger's database, UDP) are added on top as before. Safe to delete | when the log changes |
| `data/update.json`                            | DX Agent: the latest version on GitHub, asked every hour (`ui.check_updates`), with the packages the release brings | every hour |
| `data/update/`                                | DX Agent's own update: the package downloaded and unpacked (`new/`), the backup the script left (`before-<version>/`) and what it did (`update.log`) | on an update |
| `data/dx-agent.log`                           | DX Agent (without a window) | while it runs; kept under 5 MB |

### data/dxagent.db

DX Agent's own records are one SQLite file (Python has SQLite built in; nothing to
install). Everything downloaded from elsewhere stays the file it came as: it is replaced
whole and read whole. The tables:

| Table        | What                                                   | Kept |
|--------------|--------------------------------------------------------|------|
| `alerts`     | every alert: time, call, band and the alert as JSON    | `alerts.keep_days` days (7) |
| `activators` | where each activator was (call, time, references)      | 32 days |
| `hunted`     | your QSOs with activators seen on the air (call, program, reference, band, time) | for good |
| `udp_qsos`   | QSOs your programs sent over UDP that your log file doesn't have yet (their ADIF fields) | until the log has them; at most 2,000, 30 days |
| `window_hour` | when each country you miss is heard near you: country, band, mode, UTC hour and month, on how many days and how many spots, how far and how strong, who heard it last (Ventanas) | `windows.keep_months` months (24) |

Any SQLite tool opens it (DB Browser for SQLite, `sqlite3`), even while DX Agent runs.
Earlier versions wrote `alerts.jsonl` (and `activations*.jsonl`): the first start reads
them in and renames them `*.migrated`; delete those when you like. An alert's `data`, for
example (shortened):

```json
{"utc": "2026-10-13T14:55:04+00:00", "call": "VP2MAW", "freq_khz": 14030.0, "band": "20m",
 "mode": "CW", "mode_group": "CW", "entity": "Montserrat", "dxcc": 96, "reasons": ["dxpedition"],
 "headline": "DXPED HAVE", "need": [], "need_text": "have it: 20m CW confirmed", "lotw": "no LoTW",
 "source": "rbn", "spotter": "WE9V", "snr": 7, "wpm": 27,
 "dxpedition": {"entity": "Montserrat", "end": "2026-10-20", "qsl": "?", "info": "By DK8YY ..."}}
```

---

## 10. Known limitations and troubleshooting

### Known limitations

- **Windows-only features.** Everything else works on Linux with the `-linux` package, and on a Mac with the `-macos` one (pop-ups included, in Notification Center). Not
  available there: Log4OM's live log, OmniRig and Log4OM Tune; sending the call to WSJT-X; and the Windows message box when it
  can't start (there the reason goes to `data/dx-agent.log`). On Linux, pop-ups need `plyer`, and
  the Settings "Browse…" button needs tkinter (`python3-tk`); a Mac uses its own Choose file
  window. The LoTW password is encrypted with Windows DPAPI; on Linux and a Mac it is only
  obfuscated, with file permissions `0600`.
- **A QSO you just saved, with Log4OM 2:** DX Agent reads it straight from Log4OM's
  database within about 10 seconds, without waiting for the next ADIF backup
  (`logbook.live`, on by default). It finds the database in Log4OM's `l4ong.status`, opens
  it read-only, and takes only the QSOs after the backup's newest. The alerts already listed
  say what they need now; the DXpeditions, activations and the map's slots refresh too.
  The backup is still the log: it is read whole at start and whenever it changes. Not read:
  Log4OM on MySQL, or a Log4OM log that isn't the one in Settings (the database must hold
  the backup's newest QSO). Confirmations Log4OM gets for older QSOs still wait for the
  backup (or DX Agent's own LoTW download).
- **A station you just worked keeps alerting, with other loggers.** Unless the logger tells
  DX Agent each QSO (over UDP: N1MM Logger+, DXLog.net, WSJT-X...) or writes its ADIF as it
  goes, a new QSO counts only once the log file has it. See "Your QSOs as you log them".
- **LoTW download not yet tested with a real account.** The public LoTW list works;
  the confirmation download and **Test login** follow the ARRL report format but
  haven't been run with a real password yet.
- **Mode from the frequency on cluster spots.** When neither the comment nor RBN
  says the mode, it comes from the frequency (hover the mode to see so). A station
  outside the usual segments (SSB in the CW part, a DXpedition's FT8 on its own
  frequency) can be misread; the digital part is shown with `?`.
- **Announced dates are approximate.** A DXpedition alerts from one day before its start
  date. When its announced end has passed, DX Agent reads its sources (NG3K, 425 DX News, Club
  Log) again right away, before it leaves the list: if one extended it, it stays with the new
  date; if they still say it's over, it leaves the DXpeditions tab and the alerts. While the
  sources can't be read, it stays (they are tried again every 30 minutes), at most two days
  past its end. A new UTC day works out again which ones are on.
- **KG4 calls.** The country file gives the whole KG4 prefix to Guantanamo Bay, but only KG4
  calls with a two-letter suffix (KG4AA) are there: KG4 + one or three letters (KG4OJT) is a
  US call, and DX Agent takes it as such. Guantanamo stations the file lists by name count
  as Guantanamo.
- **The country file** (AD1C's `cty.csv`) is downloaded again when a day old, checked every
  6 hours while DX Agent runs; when it changed, spots use the new one and your log is
  indexed again with it.
- **Starting doesn't wait for downloads.** DX Agent starts on the lists it has kept, however
  old (the country file, LoTW's user activity, RBN's skimmers, the DXpeditions, Club Log's Most
  Wanted), and right after it gets the ones a day old, or older than their refresh time, in the
  background. Only the first start, with none kept, waits for them.
- **Portable calls.** Calls like `TF/PD9DX` resolve to the shorter prefix. Rare cases,
  such as `3D2/R` for Rotuma, can resolve to the wrong country.
- **Log4OM Tune requires OmniRig.** Frequency and mode go through guarded OmniRig; Tune is
  blocked if OmniRig cannot verify RX, even when Log4OM controls the radio another way.
- **60 m is off by default.** Select it under **Bands** to watch it; there is no
  band-plan mode guess for 60 m.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Yellow banner "DX Agent can't start: No ADIF file found" | Open Settings, fix the log path and use **Test** until it finds the file, then save |
| `config.toml` not found | It is in your DX Agent folder ([Quick start](#1-quick-start)); with `-c`, give the full path |
| Settings won't save, red list under the button | Fix each item listed; nothing is saved until they are all fixed |
| A setting change made things worse | `config.toml.bak` holds the previous settings: copy it over `config.toml` and restart |
| "saved password could not be read" | The password was saved by another Windows user or PC; type it again in Settings |
| `[cluster] ... dropped ...; trying ...` | Normal; it moves to the next cluster in the list by itself |
| Few alerts from the cluster | Normal; the cluster sends a few spots a minute against several per second from RBN, and RBN often reports the same station first |
| No pop-ups for some alerts | Check **Windows pop-ups** in Settings; DXPED HAVE, NEW SLOT and NEW CALL never pop up by default |
| No pop-ups at all | Tick **Show pop-ups** in Settings, and check that Windows notifications are on (Windows Settings → System → Notifications, including "Windows PowerShell", which shows them) |
| Colours show as `[1;93m` in the terminal | Use Windows Terminal or the VS Code terminal |
| `ImportError: bad magic number in 'dxagent'` | You are running the Windows zip on Linux: it is compiled for its own Python. Use the `-linux` package, or the source zip with your own Python |
| `Permission denied` running `./start-dx-agent.sh` | `chmod +x start-dx-agent.sh start-dx-agent-console.sh` (not needed with the `-linux` package) |
| No pop-ups on Linux | `pip install plyer`; the alerts still appear in the dashboard without it |
| Mac: "start-dx-agent.command cannot be opened" / "Apple could not verify…" | It isn't signed by Apple: System Settings > Privacy & Security > **Open Anyway**, or `xattr -dr com.apple.quarantine .` in the dx-agent folder (see Quick start) |
| Windows: "Windows protected your PC" / "This file came from another computer…" | It isn't a signature problem: Windows marks the downloaded `.zip` and passes the mark on to what is extracted. Delete the folder, unblock the `.zip` (**Properties** > **Unblock**), unzip it again (nothing to do after that: updates don't come from a browser) |
| Wrong or old country data | Delete `data/cty.csv`; it downloads again on the next start |
| `[ui] could not start on port 8073` | Another program (or a second copy of DX Agent) uses that port; stop it or change the dashboard port |
| Dashboard shows "Lost connection to the agent" | `run` stopped or crashed; start it again and the page reconnects by itself |
| Dashboard is empty after a restart | It fills with the cluster's spots from the last 30 minutes as soon as the cluster connects (unless **Recent spots on connecting** is 0). Older alerts are in `data/dxagent.db` (table `alerts`) |
| DXpedition list looks old | Delete the `data/dxped-*.json` files |
| LoTW confirmations look wrong | Delete `data/lotw_qsls.adi` and `data/lotw_state.json` to force a full download |
