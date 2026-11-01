# DX Agent

[![Downloads](https://img.shields.io/github/downloads/lw5hr/dx-agent-download/total?label=downloads&cacheSeconds=3600)](https://github.com/lw5hr/dx-agent-download/releases)
[![Latest version](https://img.shields.io/github/v/release/lw5hr/dx-agent-download?sort=semver&label=version)](https://github.com/lw5hr/dx-agent-download/releases/latest)

**DX Agent** watches the DX cluster and the Reverse Beacon Network, checks every spot against
your log, and tells you the moment a station you still need is on the air: a new country, band
or mode, a DXpedition that adds something, a summit or park you haven't worked. It runs on
your PC (Windows, Linux or Mac) and you use it from your browser.

*Castellano más abajo.*

![DX Agent: the alert list and a station](images/station.en.png)

## Download

**[Download the latest version](https://github.com/lw5hr/dx-agent-download/releases/latest)**
— Windows: `dx-agent-<version>-windows.zip`, unzip it and double-click `start-dx-agent.bat`.
Linux (x86_64): `dx-agent-<version>-linux-x86_64.tar.gz`, unpack it and run `./start-dx-agent.sh`.
Mac: `dx-agent-<version>-macos.tar.gz`, unpack it and double-click `start-dx-agent.command`.
Nothing to install: Python comes inside.

- **[User manual](MANUAL.en.md)** — install, first setup, the screen, alerts, tuning the
  radio, your logger, DXpeditions, POTA/SOTA, the map, the CQ DX Marathon, LoTW, the logbook.
- [Technical documentation](docs/DOCUMENTATION.md) — every setting and how it works inside.
- Problems or ideas: [Issues](https://github.com/lw5hr/dx-agent-download/issues).
- Page for sharing: **https://lw5hr.github.io/dx-agent-download/** (and [/es/](https://lw5hr.github.io/dx-agent-download/es/) in Spanish) — screenshots and the answers to the usual questions, to send someone instead of the whole README.

What it does:

- Alerts for **ATNO**, new band, new mode, DXpeditions you need, and your watchlist, from the
  cluster and the RBN (CW, RTTY, FT8/FT4).
- **DXpeditions** from NG3K, 425 DX News and Club Log, with what each one adds to your log and
  whether you're in their log.
- **Near you:** whether the station is being heard close to your QTH, and whether your own
  signal gets to it.
- **Propagation:** VOACAP built in, the chance of a QSO with each station this hour; and an alert
  when 6 m or 2 m opens around you.
- **LoTW:** who uploads, and your own confirmations.
- **Tune** your radio with one click (Log4OM, N1MM, DXLog.net, OmniRig, Hamlib, flrig, DXLab, WSJT-X), with
  the call filled in in Log4OM and WSJT-X; with a FlexRadio on AetherSDR (TCI, in testing) the alerts
  also show on its panadapter.
- **POTA, SOTA, IOTA, WWFF** and more, with the summits and parks you haven't worked.
- A **world map** with your DXCC and WAZ standing and your grid squares, as GridTracker shows them (VUCC, FFMA); click a country to see what you have of it.
- The **CQ DX Marathon**, the year or the Sprint: your countries and zones, and alerts for the
  ones you still need.
- **Several callsigns** (a contest call, say), each with its own log, counted together.
- Your new QSOs counted at once: straight from Log4OM, or over UDP from N1MM Logger+,
  DXLog.net, HRD and WSJT-X.
- **Its own logbook** (experimental): log, edit and filter your QSOs in DX Agent, upload them to
  LoTW and Club Log, and see who confirmed.

---

# DX Agent (castellano)

**DX Agent** vigila el DX cluster y la Reverse Beacon Network, compara cada spot con tu log y te
avisa apenas sale al aire una estación que necesitás: un país, una banda o un modo nuevos, una
DXpedición que te suma algo, una cumbre o un parque que no trabajaste. Para Windows, Linux y Mac: corre en tu
PC y se usa desde el navegador.

![DX Agent: la lista de alertas y una estación](images/station.es.png)

## Descarga

**[Bajar la última versión](https://github.com/lw5hr/dx-agent-download/releases/latest)**
— Windows: `dx-agent-<versión>-windows.zip`, descomprimilo y hacé doble clic en
`start-dx-agent.bat`. Linux (x86_64): `dx-agent-<versión>-linux-x86_64.tar.gz`, descomprimilo y
corré `./start-dx-agent.sh`. Mac: `dx-agent-<versión>-macos.tar.gz`, descomprimilo y hacé doble
clic en `start-dx-agent.command`. No hay nada que instalar: trae Python adentro.

- **[Manual de usuario](MANUAL.es.md)** — instalación, primera configuración, la pantalla,
  alertas, sintonizar la radio, tu programa de log, DXpediciones, POTA/SOTA, el mapa, el CQ DX
  Marathon, LoTW, el logbook.
- [Documentación técnica](docs/DOCUMENTACION.md) — todas las opciones y cómo funciona por
  dentro.
- Problemas o ideas: [Issues](https://github.com/lw5hr/dx-agent-download/issues).

---

Made by / Creado por Diego – LW5HR · Collaborators / Colaboradores: **Javi – LU5FF** (QA Product Advocate), Franco – LU2PWY, Juan Pablo – LU9HVR, Gustavo – LU7HW, Daniel – LU1HLH

Free software, [MIT License](LICENSE) / Software libre, licencia MIT.

Support DX Agent / Apoyá DX Agent:
[Ko-fi](https://ko-fi.com/lw5hr) · [PayPal](https://paypal.me/diegodimunzio1)
