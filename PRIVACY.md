# DX Agent — Privacy Policy

*Last updated: November 9, 2026*

DX Agent is a free desktop program for amateur radio operators. It runs on your own computer, with a local web interface at `http://localhost`. It is developed by Diego Dimunzio (LW5HR).

## What the developer collects

Nothing. DX Agent has no telemetry, analytics, crash reporting, advertising or user accounts. The developer receives no data about you or about how you use the program.

## What stays on your computer

Your settings, logbook, cached reference data and any credentials you enter (callbook logins, API keys for LoTW, Club Log or the QRZ Logbook) are kept only on your computer, in `%APPDATA%\DX Agent\data`. Uninstalling the program and deleting that folder removes them.

## Connections the program makes

To do its job, DX Agent connects to public amateur radio services. It sends each one only what the request needs:

| Purpose | Services | What is sent |
|---|---|---|
| DX spots | The DX cluster you choose; Reverse Beacon Network | Your callsign, as the login those services require |
| Reference data (downloads) | country-files.com, supercheckpartial.com, SOTA, POTA, WWFF, NG3K, 425 DX News, dxmarathon.com, NOAA SWPC, KC2G, GridTracker (gitlab.com) | Nothing about you: plain file downloads |
| Lookups you ask for | QRZ.com, HamQTH, QRZCQ; PSKReporter | The callsign you look up, plus your login for that callbook if you set one up |
| PSKReporter live feed (off by default) | mqtt.pskreporter.info | Your grid square, to subscribe to nearby reports |
| Tropospheric forecast | Open-Meteo | Your approximate location, from your grid square |
| Log uploads (only if you set them up) | ARRL LoTW, Club Log, QRZ Logbook | The QSOs you upload, with your own credentials |
| Update check | GitHub (api.github.com) | The program version, in the User-Agent header |

Each of these services handles the data under its own privacy policy. DX Agent sends no information to any other system unless you ask it to.

## Donations

The donation links (Ko-fi, PayPal, Cafecito, Wise) only open those websites in your browser. DX Agent does not see or store payment details.

## Contact

Questions about this policy: open an issue at https://github.com/lw5hr/dx-agent-download/issues
