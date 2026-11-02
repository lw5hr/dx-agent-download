# DX Agent — Guía de uso

*Creado por Diego – LW5HR, con **Javi – LU5FF** (QA Product Advocate), Franco – LU2PWY, Juan Pablo – LU9HVR, Gustavo – LU7HW, Daniel – LU1HLH. Licencia MIT. Apoyá DX Agent: [Ko-fi](https://ko-fi.com/lw5hr) · [PayPal](https://paypal.me/diegodimunzio1) · desde Argentina, [Cafecito](https://cafecito.app/lw5hr) · con tarjeta o transferencia, [Wise](https://wise.com/pay/me/diegod2572).
English version: [DOCUMENTATION.md](DOCUMENTATION.md).*

DX Agent vigila el DX cluster y la Reverse Beacon Network (RBN), compara cada
estación reportada con tu log ADIF y avisa cuando sale al aire una que todavía
necesitás. Funciona en tu PC, con un panel en el navegador, y solo requiere Python
3.11 o posterior: no hay nada más que instalar.

Responde tres preguntas en tiempo real:

- **¿Me falta esta estación en el log?** Un país nuevo (ATNO), una banda nueva, un
  modo nuevo o un indicativo de tu lista de seguimiento.
- **¿Es una DXpedición activa y realmente la necesito?** Sigue las listas de
  DXpediciones de NG3K, 425 DX News y Club Log e indica si trabajarla suma algo nuevo, te da una
  confirmación que falta o no suma nada.
- **¿Voy a obtener la confirmación?** Muestra si la estación sube sus QSOs a LoTW y
  puede descargar tus propias confirmaciones de LoTW.

Contenido:

1. [Inicio rápido](#1-inicio-rápido)
2. [Panel web](#2-panel-web)
3. [Página de configuración](#3-página-de-configuración)
4. [Comandos](#4-comandos)
5. [Cómo leer las alertas](#5-cómo-leer-las-alertas)
6. [El archivo de configuración](#6-el-archivo-de-configuración)
7. [Integración con LoTW](#7-integración-con-lotw)
8. [Cómo funciona](#8-cómo-funciona)
9. [Archivos del proyecto y datos descargados](#9-archivos-del-proyecto-y-datos-descargados)
10. [Limitaciones conocidas y solución de problemas](#10-limitaciones-conocidas-y-solución-de-problemas)

---

## 1. Inicio rápido

**Lo más fácil:** descomprimir `dx-agent-<versión>-windows.zip` en cualquier carpeta y
hacer doble clic en **start-dx-agent.bat**. Ese zip ya trae Python, así que no hay que
instalar nada. DX Agent corre sin ventana: el panel se abre en el navegador,
**Detener** (arriba a la derecha del panel) lo cierra, y si se hace doble clic de nuevo
mientras corre, solo abre el panel. Si se abre una versión nueva con la anterior todavía
corriendo, primero se detiene la anterior (como con su botón Detener) y arranca la nueva. Si no puede arrancar, un cartel de Windows dice por
qué; lo que va mostrando queda en `data/dx-agent.log` de tu carpeta de DX Agent (ver más abajo), y **start-dx-agent-console.bat**
lo corre en una ventana para verlo. (El zip con el código, `dx-agent-<versión>-source.zip`,
requiere
[Python 3.11+](https://www.python.org/downloads/) instalado con "Add python.exe to
PATH"; si no está, start-dx-agent.bat lo avisa y ofrece instalarlo con winget.)

**En Linux:** descomprimir `dx-agent-<versión>-linux-x86_64.tar.gz` (también trae Python) y
usar su propio lanzador. Necesita glibc 2.17 o superior, o sea cualquier distribución de 64
bits normal:

```sh
tar -xzf dx-agent-<versión>-linux-x86_64.tar.gz
cd dx-agent
./start-dx-agent.sh
```

Ahí funciona todo salvo los programas de Windows; ver
[Limitaciones conocidas](#limitaciones-conocidas). Para usar tu propio Python 3.11+ en vez del
paquete, usar el zip con el código y `python3 -m dxagent run`.

**En una Mac:** descomprimir `dx-agent-<versión>-macos.tar.gz` (doble clic en Finder; trae
Python para las Mac con Apple Silicon y para las Intel) y hacer doble clic en
**start-dx-agent.command**, en la carpeta `dx-agent`. Se abre la Terminal un momento y el panel
se abre en el navegador. El paquete no está firmado por Apple, así que la primera vez macOS no
lo deja abrir: abrir **Configuración del Sistema > Privacidad y seguridad**, hacer clic en
**Abrir igualmente** junto al aviso sobre start-dx-agent.command y confirmar (en macOS 14 o
anterior también sirve clic derecho sobre el archivo > **Abrir**). Desde ahí alcanza con doble
clic. O, en la Terminal:

```sh
cd ~/Downloads/dx-agent
xattr -dr com.apple.quarantine .
./start-dx-agent.command
```

En la Mac también funciona todo salvo los programas de Windows ([Limitaciones conocidas](#limitaciones-conocidas)).

**Tu configuración y tus datos** se guardan fuera de la carpeta del programa, en una carpeta
tuya que usan todas las versiones. Son `config.toml` y la carpeta `data`, donde están el
historial de alertas, la contraseña de LoTW guardada y el log si empezaste de cero:

| Sistema | Carpeta |
|---|---|
| Windows | `%APPDATA%\DX Agent` |
| Mac | `~/Library/Application Support/DX Agent` |
| Linux | `~/.config/dx-agent` (o `$XDG_CONFIG_HOME/dx-agent`) |

Para actualizar alcanza con descomprimir la versión nueva donde quieras y abrirla; la carpeta
vieja se puede borrar. **Configuración** muestra la ruta exacta de `config.toml`. Hasta la
0.4.x se guardaban en la carpeta del programa: la primera vez que se abre una versión más
nueva, copia la configuración y los datos desde ahí o desde la versión anterior que esté al
lado (por ejemplo `dx-agent-0.4.3-windows\dx-agent`), y lo avisa en el panel. La versión vieja
queda como estaba. Si no encuentra ninguna, el primer inicio crea `config.toml` a partir de
`config.example.toml`; después configurar indicativo y log en **Configuración**. Para usar
otro `config.toml`: `python -m dxagent -c ruta/config.toml run` (sus datos van en `data`, al
lado), o la variable de entorno `DXAGENT_HOME` con otra carpeta.

Desde una terminal:

1. Abrir una terminal. En VS Code: **Terminal → New Terminal**.
2. Ir a la carpeta del proyecto:

   ```powershell
   cd C:\path\to\dx-agent
   ```

3. Iniciarlo:

   ```powershell
   python -m dxagent run
   ```

   El navegador abre el panel en **http://localhost:8073**.
4. La primera vez, hacer clic en **Configuración** (arriba a la derecha) y revisar el
   indicativo, la ruta del log ADIF y, si se quiere, la contraseña de LoTW. Luego
   **Guardar y aplicar**. (Si el panel aparece en inglés, el botón **EN** del
   encabezado lo pasa a español.)
5. Para detenerlo, presionar **Ctrl+C** en la terminal (muestra `73!`).

Usa el `config.toml` de tu carpeta de DX Agent (ver arriba), desde donde sea que se ejecute.
Para usar otro, indicar su ruta (sus datos van en `data`, al lado):

```powershell
python -m dxagent -c C:\path\to\config.toml run
```

En Linux son los mismos comandos con `python3` y `/path/to/dx-agent`.

Un arranque normal se ve así en la terminal, seguido de una línea por cada estación
necesitada:

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

Cada 10 minutos imprime una línea de estado con la cantidad de spots procesados y de
alertas generadas.

**Notificaciones:** las alertas también aparecen como notificaciones de Windows
(Windows 10/11), y en el Centro de notificaciones de la Mac, sin instalar nada adicional. En
Windows, al hacer clic en una se abre el panel en esa estación (su grilla, con su fila a la vista). En
Linux necesitan `plyer` (`pip install plyer`); sin él, las alertas igual se ven en el panel.

---

## 2. Panel web

`run` inicia el panel y lo abre en el navegador en **http://localhost:8073**. La
terminal sigue funcionando igual que antes; el panel es otra vista del mismo agente y
se cierra al detener `run`.

```powershell
python -m dxagent run               # terminal + panel, abre el navegador
python -m dxagent run --no-browser  # panel activo, sin abrir una pestaña
python -m dxagent run --no-ui       # solo terminal
```

### Qué hay en la pantalla

| Zona | Qué muestra |
|------|-------------|
| **Encabezado** | Tu indicativo; una pastilla por fuente de spots (verde = conectada, ámbar = conectando, rojo = caída) con la cantidad de spots (al pasar el mouse muestra el servidor y la hora del último spot; un clic deja en la lista y el mapa solo las estaciones que escuchó, ver Filtros); una pastilla **DXpediciones** al lado: cuántas están dentro de sus fechas y cuántas de ellas se spotearon en los últimos 15 minutos ("48 · 6 en el aire", con el punto verde mientras alguna lo está; al hacer clic abre la pestaña DXpediciones); los totales de tu log; botones con íconos (al pasar el mouse dicen qué hace cada uno): **Acerca de** ⓘ (qué es DX Agent, quién lo hizo, los colaboradores, cómo apoyarlo, y ayuda: el sitio web, el manual de usuario y la página de issues), **Configuración** ⚙ (en la página de Configuración, un ícono de lista vuelve a las alertas), **EN/ES/PT** (idioma), **Tema** (medio círculo = Auto, sol = Claro, luna = Oscuro, una paleta = otro tema; un clic abre el menú de temas), **Sonido** (parlante, tachado si está apagado), **Pantalla completa** (cuatro esquinas; también la tecla **F**, se sale con F o Esc) y **Detener** (rojo); reloj UTC. `#about` abre la ventana Acerca de. En una ventana más angosta (hasta 1800 px) las pastillas van debajo de tu indicativo y los botones, a todo el ancho; el chevron después de ellas las pliega a sus puntos de estado, en una sola pastilla resaltada al lado de tu indicativo (un clic la vuelve a abrir; se recuerda en el navegador) |
| **Filtros** | Tres filas separadas por una línea: tipo de alerta (con **Lista** / **Mapa** y **Limpiar lista**); banda, modo y los demás; continente y un cuadro de búsqueda por indicativo o país. **Continente** (AF, AN, AS, EU, NA, OC, SA) deja las estaciones de los continentes elegidos, para quedarte con hacia donde apunta tu antena; tu propio indicativo spoteado se ve siempre. Solo aparecen los tipos de alerta, las bandas y los modos de tus alertas en Configuración; el ⚙ junto a Limpiar filtros (o Configuración → Filtros sobre la lista) elige cuáles de Continente, Solo cerca tuyo, Ocultar confirmados, Solo LoTW y Actividad se ven, y uno oculto queda apagado. El ⚙ al final de los tipos de alerta (o Configuración → Tipos de alerta sobre la lista) hace lo mismo con ellos: un tipo oculto ahí sigue alertando, solo se va su filtro. Cada opción dice cuántas estaciones mostraría, con los demás filtros como están (con 20 m elegido, los modos dicen cuántas hay en 20 m; una estación en varias bandas es una). Sin ningún botón seleccionado se muestra todo. Una alerta cuenta para cada uno de sus motivos, así que una DXpedición en tu lista de seguimiento aparece tanto en **DXPED FALTA** como en **SIGUIENDO**; **SIGUIENDO** además muestra los spots de tus indicativos en seguimiento que no dieron alerta (filas grises **SPOT**), para que veas cuándo están en el aire. Con varios tipos elegidos se ve cualquiera de ellos, salvo **SIGUIENDO**: junto con otro tipo, solo tus indicativos en seguimiento que además son de ese tipo (**SIGUIENDO** + **BANDA+MODO**: los que seguís en una banda y modo que te faltan; sus filas SPOT según lo que suman). Las filas SPOT son una por estación, banda y modo: el spot más reciente, con **×N** la cantidad (un CQ lo escuchan varios skimmers de la RBN a la vez; pasando el mouse se ve quién la escuchó); los anteriores a una alerta de esa estación, banda y modo quedan representados por la alerta. Una fila SPOT que todavía te suma algo (no dio alerta propia porque la misma alerta no se repite durante el tiempo de espera) va con el color de lo que suma, no en gris. **Ocultar confirmados** saca las estaciones cuya entidad ya tenés confirmada en esa banda y modo (una alerta de indicativo nuevo, una fila SPOT): quedan solo las que suman a tu log. **Solo LoTW** deja las estaciones que subieron a LoTW en los últimos 12 meses y las DXpediciones que anunciaron LoTW: las que probablemente confirmen ahí. Un clic en la pastilla de una fuente en el encabezado (Cluster, RBN CW, RBN FT8, PSKReporter, WSJT-X) deja las filas que spoteó esa fuente (las de la lista son alertas, lo que te suma al log: muchas menos que los spots que cuenta la pastilla) y las estaciones que escuchó en esa banda en los últimos 15 minutos, la haya spoteado quien sea primero (WSJT-X: las que decodificó tu propio WSJT-X o JTDX, las que se escuchan donde estás); la pastilla queda resaltada y los filtros plegados lo dicen, y otro clic o **Limpiar filtros** vuelve a mostrar todas las fuentes. El navegador recuerda los filtros. **Limpiar lista** (después de confirmar) vacía la lista de alertas, en todos los paneles abiertos y también al recargar, y reinicia el tiempo sin repetir: lo que siga en el aire vuelve a avisar en su próximo spot. El historial de alertas (`data/dxagent.db`) y los últimos spots de la pestaña Estación se conservan. Una sola estación: la **✕** al lado de su indicativo (aparece con el mouse sobre la fila), o clic derecho en la fila → **Quitar de la lista**, saca esa estación en esa banda de la lista (y del panadaptador de la radio) en todos los paneles abiertos; su tiempo sin repetir sigue, así que vuelve a avisar cuando termine. El **ancla** al lado de la ✕ (**Fijar en la lista**) deja esa estación en esa banda en la lista aunque haga mucho que no se spotea (no la saca **Quitar de la lista después de**, ni que la lista esté llena, ni **Limpiar lista**, ni reiniciar DX Agent), arriba de todo con cualquier orden, resaltada y con su ancla siempre a la vista, y en el panadaptador de la radio; queda fijada hasta que la saques con su ✕, la trabajes en esa banda (tu log lo dice) o hagas clic otra vez en su ancla. En todos los paneles abiertos. La flecha al lado de **Lista** / **Mapa** pliega los filtros en una línea que dice lo elegido ("FILTROS 20m · CW", resaltada mientras haya un filtro puesto); la búsqueda, Limpiar filtros, el contador y Limpiar lista quedan. Plegado o no, el navegador lo recuerda |
| **Tabla de alertas** | Una fila por alerta, la más nueva arriba, coloreada según el tipo: UTC, alerta, indicativo, kHz, banda, modo, país, qué te falta, LoTW, **VOACAP** (la chance de un QSO a esta hora, ver La predicción: VOACAP), **cerca tuyo** (ver más abajo), quién la escuchó. Al hacer clic en el encabezado de una columna se ordena por ella (kHz, banda, modo agrupado CW / fonía / digital, país...; **Alerta** y **Qué te falta** ponen primero lo más buscado, **LoTW** las subidas más recientes); otro clic, al revés; un tercero vuelve a lo más nuevo arriba. La flecha muestra el orden; las filas sin dato en esa columna van al final, los empates quedan con la más nueva primero, las alertas nuevas entran en su lugar y el orden se recuerda en el navegador. Las filas nuevas destellan. Un spot más nuevo de la estación en la misma banda y modo (uno que no avisó porque no se repite) actualiza su fila: hora, frecuencia, modo, quién la escuchó (×N); así la fila muestra dónde está la estación ahora, y el botón Sintonizar va ahí. Las filas se atenúan a los 10 minutos del último spot de la estación y más a los 30 (al pasar el mouse se ve la antigüedad y la hora de la alerta); con **Quitar de la lista después de** en Configuración, salen de la lista pasados esos minutos |
| **Pestaña Estación** | Al hacer clic en una alerta, o escribir un indicativo en el cuadro, muestra la grilla banda × modo de ese país (C verde = confirmado, W ámbar = trabajado, gris = no trabajado; un anillo verde marca las bandas y modos donde la spotearon en los últimos 15 minutos, el más reciente parpadeando, con un punto sobre la banda), si trabajaste ese indicativo exacto, el estado de LoTW, los datos de la DXpedición, quién lo escucha más cerca tuyo, un botón **Consultar PSKReporter** (o, en vivo, los receptores que la reportan a medida que llegan), los botones **Ver solo** este indicativo, **☆ seguimiento** y **Spotear**, sus últimos spots y enlaces a QRZ.com, HamQTH y DXWatch. La flecha a la derecha de las pestañas pliega el panel a una columna con sus íconos (una radio, el globo, una montaña, un trofeo), donde se siguen viendo las DXpediciones en el aire y el puntaje del Marathon; al hacer clic en un ícono se abre en esa pestaña (abajo de la lista en una pantalla angosta: solo la fila de pestañas). Mientras está plegado, al pasar el mouse por una fila de la lista aparece la tarjeta de esa estación: su país, el estado y la grilla banda × modo. Plegado o no, el navegador lo recuerda |
| **Pestaña DXpediciones** | DXpediciones activas y las que empiezan en los próximos 30 días. Etiqueta: **ATNO**, **No confirmado** o cuántas bandas tenés (por ejemplo "1 de 10 bandas", resaltada cuando son menos de la mitad). Marcar **solo las que faltan** oculta las que ya tenés en la mayoría de las bandas. Ordenadas por las que están **en el aire** (spoteadas en los últimos 15 minutos, la más reciente arriba), por el puesto en el **Most Wanted** de Club Log (el país más buscado primero) o por fecha de inicio: **Orden**, arriba. Cada tarjeta muestra sus fuentes y el puesto en el **Most Wanted** de Club Log; las spoteadas en los últimos 15 minutos se marcan en verde como **EN EL AIRE**. Al hacer clic se abre su grilla; la **☆** la agrega a tu lista de seguimiento |

**¿Qué estación fue?** Al pasar el mouse sobre una celda **C** o **W** de la grilla de la pestaña
Estación, una tarjeta lista los QSOs que la hicieron: indicativo, fecha, modo y un **✓** si está
confirmado, del más nuevo al más viejo, hasta ocho (después "+N más"): la forma más rápida de saber
si el QSO de 20 m con Santo Tomé fue la expedición actual u otra estación de hace años. La celda
sigue mostrando eso y, si la estación está en el aire, su último spot.

**En el aire, en la grilla de la pestaña Estación.** La grilla banda × modo también muestra
dónde está transmitiendo la estación ahora:

- **Anillo verde** en cada banda y modo donde la spotearon (cluster o RBN) en los últimos 15
  minutos, y un **punto ●** sobre esa banda. El anillo está separado del cuadro, así se ve
  igual sobre una **C** confirmada, una **W** trabajada o un cuadro vacío; sobre uno vacío,
  está en el aire en una banda que te falta.
- **Parpadeo:** solo el cuadro del **spot más reciente**, donde está ahora la estación. Los
  otros quedan con el anillo fijo. Cuando llega un spot en otra banda, el parpadeo pasa ahí.
- **En varias bandas a la vez** (una DXpedición con varias estaciones, por ejemplo S9R): cada
  banda spoteada en los últimos 15 minutos tiene su anillo, y parpadea la más reciente.
- **Pasando el mouse** por un cuadro con anillo: cuándo la spotearon, en qué frecuencia y
  modo, y quién.
- **Clic** en un cuadro con anillo (con una radio configurada, ver Sintonizar la radio):
  sintoniza el spot más reciente de esa banda y modo, y el botón Sintonizar de la pestaña
  Estación queda en ese spot.
- Un spot que no dice su modo marca la banda entera. Sin spots durante 15 minutos, el anillo y
  el punto se apagan. Con las animaciones de Windows apagadas, el más reciente tiene un anillo
  más grueso en vez de parpadear.

**Colores de banda.** Cada banda de HF y 6 m tiene su color, que se usa en la etiqueta
de banda de la tabla, en los filtros de banda, en la grilla de la estación y en la
configuración: 160 ámbar, 80 violeta, 60 rojo, 40 azul, 30 oliva, 20 rosa, 17 verde,
15 turquesa, 12 marrón, 10 púrpura, 6 naranja (4 m, 2 m y 70 cm comparten el gris).
El orden se verificó con un simulador de daltonismo para que las bandas vecinas se
distingan bien, y la etiqueta siempre muestra el nombre de la banda, así que el color
nunca es la única pista.

**Colores de modo.** La etiqueta de modo de la tabla (y de los spots de una estación) toma
el color de su grupo: CW azul, fonía (SSB, AM, FM) ámbar, digitales (FT8, FT4, RTTY...)
rosa; también los filtros de modo. Un modo que DX Agent adivinó tiene borde punteado, uno
desconocido es gris.

**EN/ES/PT** cambia el idioma del panel entre inglés, español y portugués (Brasil): cada
clic pasa al siguiente. La primera vez usa el idioma del navegador; después recuerda la
elección. Un enlace también puede forzarlo: `http://localhost:8073/?lang=es` (o
`?lang=pt`). En portugués, los enlaces al sitio web y al manual de la ventana Acerca de
abren los de inglés. Los nombres de países y las notas de las
DXpediciones quedan en inglés, porque vienen así de sus fuentes.

**Tema** abre un menú de temas, cada uno con una vista previa de sus colores: **Auto** (sigue el
modo claro/oscuro de Windows), **Claro**, **Oscuro**, **Alto contraste** (blanco sobre negro) y
**Alto contraste claro** (negro sobre blanco), **Solarized oscuro** y **claro**, **Nord**,
**Dracula** y **Sepia** (tonos cálidos de papel). Un clic lo aplica y el menú queda abierto para
probar otro; un clic afuera o Esc lo cierra. Los temas cambian el fondo, los paneles, el texto, el
color de acento y el mar y la tierra del mapa; los colores de bandas, modos y alertas siguen siendo
los del tema claro u oscuro, elegidos para distinguirse también con daltonismo. El navegador
recuerda la elección. Un enlace también puede forzar uno: `http://localhost:8073/?theme=light`
(o `dark`, `hc`, `hcl`, `sol-dark`, `sol-light`, `nord`, `dracula`, `sepia`).

**Sonido** emite un pitido en la pestaña del navegador para las alertas ATNO
y de prioridad 2. Está apagado por defecto; el agente en sí no hace ningún sonido.

**Enlaces para guardar como favoritos:** `http://localhost:8073/#settings` abre la
configuración, `#call=VP8PJ` abre esa estación y `#dxped` abre la pestaña de
DXpediciones.

**Cuando algo falla** (por ejemplo, no encuentra el archivo del log), el agente
mantiene el panel funcionando y muestra una franja amarilla con el motivo y un enlace
a la configuración, para corregirlo sin usar la terminal.

### Sintonizar la radio

Con una radio configurada (Configuración → **Radio (botón Sintonizar)**), al hacer
clic en la frecuencia de una alerta se le pide a tu programa de log o de control de
radio que mueva la radio a esa frecuencia, y la estación se abre a la derecha, igual que al
hacer clic en la fila. La pestaña Estación también tiene un botón
**Sintonizar**: para la fila en la que hiciste clic en la lista (resaltada más fuerte que
las otras filas del mismo indicativo) o, si no, para el último spot de esa estación. Un mensaje arriba a la derecha
indica si funcionó.

| Destino | Cómo se comunica DX Agent | Puerto por defecto | ¿También el modo? |
|---------|---------------------------|--------------------|-------------------|
| Log4OM 2 | Control remoto por UDP (`SetTxFrequency`, `SetCallsign`); el modo, por OmniRig | 2241 | sí, por OmniRig (el `SetMode` de Log4OM solo cambia su pantalla) |
| N1MM Logger+ | UDP `radio_setfrequency` | 13064 | no (N1MM no tiene campo de modo) |
| DXLog.net | UDP `radio_setfrequency` (como N1MM); en Options → Configure network agregar el puerto al UDP broadcast listener, y activar Options → Broadcast → Receive broadcasts | 13064 | no (solo la frecuencia) |
| OmniRig | COM de Windows, mediante PowerShell; radio 1 o 2 | — | sí |
| Hamlib rigctld | TCP `F <Hz>` / `M <modo> -1` | 4532 | sí |
| flrig | XML-RPC `rig.set_frequency` / `rig.set_mode` | 12345 | sí |
| DXLab Commander | TCP `CmdSetFreqMode` | 52002 | sí |
| TCI (AetherSDR, ExpertSDR, Thetis) | WebSocket `vfo` / `modulation`, por una conexión que DX Agent mantiene abierta; también pone las alertas en el panadaptador | 50001 | sí |

- **Modo elegido:** CW para spots de CW; USB o LSB para fonía (LSB por debajo de
  10 MHz, salvo 60 m); RTTY para RTTY; para FT8/FT4, USB con OmniRig (como WSJT-X usa
  la radio) o el modo de datos con Hamlib, flrig y DXLab. Desmarcar **También cambiar
  el modo** para cambiar solo la frecuencia.
- **Si la radio ya está en un modo que sirve, se mantiene (OmniRig, y Log4OM a través de
  OmniRig):** para un spot de FT8/FT4, una radio en USB o en su modo de datos solo cambia de
  frecuencia; para CW, una en CW o CW-R. Así una radio que necesita su modo de datos para FT8
  (un IC-9100 en USB-D) lo conserva de un spot de FT8 al siguiente: se pone en USB-D una vez.
  Los spots de fonía siempre ponen USB o LSB, para que nunca quede un modo de datos con el
  micrófono silenciado.
- **CW en radios Icom (OmniRig):** los archivos de OmniRig para Icom llaman "CW upper" al CW-R
  de la radio y "CW lower" a su CW normal, así que en un Icom DX Agent pide "CW lower" (probado:
  IC-9100 en CW, no en CW-R); en otras marcas el CW normal es "CW upper".
- **Log4OM y el modo:** el control remoto de Log4OM acepta `SetMode`, pero solo cambia el modo
  en la pantalla de Log4OM, no el de la radio (probado: Log4OM 2.42 con un IC-9100). Log4OM
  maneja la radio a través de OmniRig, así que con **También cambiar el modo** marcado DX Agent
  pone frecuencia y modo por OmniRig, en la radio de OmniRig que está en línea (primero prueba
  la de **Radio de OmniRig**), y Log4OM sigue a la radio como siempre; el indicativo se le sigue
  mandando a Log4OM. Sin OmniRig, o sin ninguna radio en línea, Sintonizar mueve la frecuencia
  por Log4OM y el mensaje avisa que el modo no cambió.
- **Log4OM:** activar Settings → Software integration → Connections → **Remote
  control** (puerto 2241). El documento de Log4OM escribe
  el comando `SetTxFrequeny`; DX Agent usa la forma que se informó que funciona,
  `SetTxFrequency`. También manda el indicativo del spot (`SetCallsign`), así la ventana de
  QSO de Log4OM queda lista para loguearlo; si escribiste un indicativo ahí a mano, Log4OM no
  lo pisa (es su regla).
- **Solo desde el panel:** igual que guardar la configuración, Sintonizar solo
  funciona desde la propia página del panel, así que otros sitios web no pueden mover
  tu radio.
- **Probado:** todos los destinos con programas de prueba; Log4OM 2.42 con una radio
  real (la frecuencia funciona, el modo no).

**FlexRadio con AetherSDR (TCI).** AetherSDR, el cliente de FlexRadio, tiene un servidor TCI
(como ExpertSDR para SunSDR, y Thetis). En AetherSDR activar Settings → **Autostart TCI with
AetherSDR**, o **Enable** en su applet TCI (puerto 50001); en DX Agent, Configuración → Radio
→ Sintonizar con **TCI**. DX Agent mantiene entonces una conexión abierta (el encabezado
muestra un indicador **TCI**: verde mientras está conectado, con la cantidad de spots en el
panadaptador), y:

- **Sintonizar** mueve al spot el slice que transmite (el de TX), o, hasta que DX Agent sabe cuál
  es (se lo pregunta a AetherSDR cada 2 s), el que tiene el foco, y pone el modo (CW, USB/LSB, RTTY,
  DIGU para FT8/FT4); un slice en CW-R lo mantiene para un spot de CW. Un spot de FT8 siempre pone
  DIGU (una Flex manda el audio DAX en DIGU), aunque esté en USB.
- **No mientras transmitís** (**Mientras transmitís (TCI)**): AetherSDR le avisa a DX Agent cuando
  la radio sale al aire y cuando deja de transmitir, así un Sintonizar en ese momento (un clic en
  un spot en pleno QSO, un spot de FT8 clickeado mientras WSJT-X transmite) no mueve la radio ni
  le cambia el indicativo a WSJT-X. **No sintonizar, y avisar** (por defecto) dice "Transmitiendo:
  no se sintonizó"; **Sintonizar cuando termina la transmisión** guarda el último y lo sintoniza
  0,3 s después de que termina (si la radio sigue en el aire más de un minuto, se descarta);
  **Sintonizar igual** sintoniza enseguida, como antes. DX Agent nunca pone la radio a
  transmitir: solo lee si está transmitiendo.
- **Split** (**Split cuando el spot lo dice (TCI)**, activado por defecto): cuando los spots de
  la estación de los últimos 15 minutos en esa frecuencia dicen dónde escucha (**UP 5**,
  **UP5K**, **5 UP**, **UP 1-3**: el medio, **DN 2**, **QSX 14.205**, **QSX 205**: los kHz después
  de los MHz), Sintonizar pone la radio en split: AetherSDR abre un segundo slice que transmite
  ahí (split por TCI), y DX Agent dice "split: transmitís en 14026.0 kHz". **UP** o **SPLIT**
  solos suben lo que diga la opción para el modo (1 kHz en CW y RTTY, 5 en fonía, al lado de la
  opción). El próximo Sintonizar mueve el slice que recibe, no el que transmite; sintonizar una
  estación sin split lo termina, y AetherSDR cierra el slice que había abierto. No en FT8 ni FT4
  (el Fox/Hound de una DXpedición no es un split de la radio), ni un split fuera de la banda o a
  más de 50 kHz.
- **WSJT-X también por TCI:** un spot de FT8 o FT4 que se manda a WSJT-X mueve el slice de WSJT-X
  (el que está en el dial que dice el Status de WSJT-X), no el de TX ni el que tiene el foco, así
  WSJT-X cambia de banda con él: AetherSDR les avisa a todos los programas la frecuencia de cada
  slice, pero WSJT-X solo lee la de su slice. Hace falta que los mensajes UDP de WSJT-X lleguen a
  DX Agent; sin ellos (o con WSJT-X en el slice de TX), como arriba.
- **Con dos o más slices abiertos**, el botón Sintonizar de la pestaña Estación pasa a ser un
  botón por slice, debajo de "Sintonizar 14025.0 kHz CW en el slice": su letra, y dónde está
  ahora (**A** 7074.0 DIGU · **B** 14010.0 CW). El slice que transmite está marcado **TX**, y se
  destaca el que sintonizan las frecuencias de la lista y la grilla: el de TX, o si no el que
  tiene el foco (cerrado el slice con el foco, hasta que AetherSDR se lo da a otro: el primero
  abierto). Elegir un slice acá lo sintoniza pero no le da el foco en AetherSDR: AetherSDR no deja
  que otro programa lo cambie. Un slice aparece con su letra desde que tuvo el foco alguna vez
  (AetherSDR la informa solo entonces); hasta ahí, con el número de RX del applet TCI de AetherSDR
  (**RX2** = el slice que el applet muestra en RX2). Los botones siguen a AetherSDR: un slice que
  se abre, se cierra, toma el foco o pasa a transmitir se ve en unos segundos.
- **Las alertas van al panadaptador** (**Mostrar las alertas en el panadaptador de la radio**,
  activado por defecto): cada estación de la lista de alertas en su color (ATNO rojo, banda
  nueva naranja, modo nuevo celeste...), con su título y su país. Se mueve cuando un spot más
  nuevo la pone en otra frecuencia, y se saca cuando ya no la spotean (después de **Quitar de
  la lista después de**, o 15 minutos), cuando se vacía la lista, o cuando tu log dice que ya
  no la necesitás: una estación que después trabajás (WORKED en la lista) sale del panadaptador, o queda en gris con **Dejar en el panadaptador, en gris, las estaciones que después trabajás**. Los spots de tu propio indicativo no se muestran. Van las alertas de todas las bandas (su número está en la pastilla TCI; un clic en ella deja en la lista las alertas que están en el panadaptador), primero las de las bandas donde están los slices de la radio, las que muestra; al pasar a otra banda, se ven las de esa banda. Los spots del cluster y la
  RBN del propio AetherSDR quedan como están: DX Agent solo agrega, y saca, los suyos. Al cerrar
  DX Agent también los saca; si terminó sin hacerlo (se colgó, lo cerró Windows), dejó anotados
  cuáles eran (`data/tci-spots.json`) y el próximo inicio los saca primero.
- **Un clic en uno de esos spots** sintoniza la radio ahí (lo hace AetherSDR) y abre la
  estación en la pestaña Estación de DX Agent.
- Si AetherSDR se cierra o se reinicia, DX Agent se vuelve a conectar solo y vuelve a poner los
  spots. AetherSDR en otra computadora: su dirección en **Dirección**.

**WSJT-X.** Configuración → Radio → marcar **Mandar también el indicativo a WSJT-X**, y en
WSJT-X marcar Settings → Reporting → **Accept UDP requests**. Después, Sintonizar en un spot
de FT8/FT4 pone la radio en la frecuencia de dial de FT8/FT4 (14074, no la 14075.6 del
spot) y completa en WSJT-X el **DX Call** y el **DX Grid** (si la RBN lo informó), elige FT8
o FT4 y mueve la frecuencia de Rx al audio de la estación (1600 Hz para 14075.6), y genera
los mensajes estándar: vos hacés clic en **Enable Tx**. Funciona con cualquiera de los
controles de radio de arriba o solo (control de radio: ninguno). DX Agent encuentra
WSJT-X solo (no hay que configurar puerto) y no ocupa el puerto UDP 2237 de WSJT-X, así
que Log4OM, JTAlert o GridTracker siguen funcionando.

### Seguir una estación

En la pestaña Estación (clic en una alerta, o en una DXpedición de la pestaña DXpediciones):

- **Ver solo VP8PJ** deja en la lista y en el mapa solo ese indicativo. La lista muestra
  también sus spots que no generaron alerta (filas grises **SPOT**, por ejemplo en una
  banda que ya tenés), así una DXpedición en el aire nunca aparece con la lista vacía. Arriba de la
  lista aparece el chip **Solo VP8PJ ✕**; hacé clic en él (o en **Ver todos**, o en
  **Limpiar filtros**) para volver a ver todos. Este filtro no se guarda: al recargar
  la página se ve todo.
- **☆ Agregar a seguimiento / ★ Quitar de seguimiento** suma el indicativo a tu lista de
  seguimiento o lo saca. Se guarda en `config.toml` y vale al instante, sin reiniciar.
  Si el indicativo entra por un comodín como `VP8*`, se ve **★ En seguimiento (VP8*)**;
  los comodines se editan en Configuración. La pestaña DXpediciones tiene la misma
  estrella en cada tarjeta.
- **Spotear** publica un spot de la estación en el DX cluster al que está conectado DX Agent
  (Configuración → Fuentes de spots), con tu indicativo: `DX 14025.0 3Y0K up 2`. Abre un
  formulario chico con la frecuencia de su último spot (la podés cambiar) y un comentario (como
  máximo 30 caracteres simples, sin acentos: lo que guardan DXSpider y AR-Cluster); después de
  confirmar sale el spot: **publicado** cuando el cluster te lo devuelve (la mayoría lo hace),
  **enviado** cuando no (W3LPL, por ejemplo: lo podés ver en DXSummit), y un error con lo que
  respondió el cluster si lo rechaza en 5 segundos (algunos nodos solo aceptan spots de usuarios
  registrados). Lo ven todas las estaciones
  conectadas a ese cluster y pasa a los demás clusters: spotearse a uno mismo está mal visto, y DX
  Agent vuelve a preguntar si lo intentás. Como máximo un spot cada 30 segundos. Con el cluster
  apagado o caído el botón queda gris; la RBN solo recibe.
- **Últimos spots** lista los spots de ese indicativo de los últimos 60 minutos, del
  cluster y de la RBN, incluso los que no generaron alerta (por ejemplo una banda que
  ya tenés). Se guardan para DXpediciones, indicativos en seguimiento e indicativos que
  dieron alerta, desde que arrancó el agente. Con el control de radio activo, hacé clic
  en una frecuencia para sintonizarla.
- **Los íconos a la derecha** de la pestaña, uno por sección (rumbo, bandas y modos, grid y
  camino, VOACAP, últimos spots, quién lo escucha, y el Marathon, el parque, la cumbre o la isla y la
  DXpedición cuando la estación los tiene): un clic oculta esa sección y otro la vuelve a mostrar, para todas las
  estaciones. El ícono de una oculta se ve tenue; el navegador recuerda cuáles.

### Activaciones: POTA, SOTA, IOTA...

El menú **Actividad** (después de los botones de modo) muestra solo activaciones: **POTA,
SOTA, IOTA, WWFF, BOTA, COTA (castillos WCA), LOTA (faros), TOTA, ROTA, JOTA, YOTA** y
**EME**, o *cualquier activación* (*ninguna*, la primera opción, es sin filtro de Actividad: se ve todo). Al lado de cada una, cuántas estaciones hay en la última hora.

- La lista muestra sus alertas y también sus spots que no generaron alerta (filas grises
  **SPOT**: un parque en un país que ya tenés también aparece), de la última hora.
- Cada fila dice la activación debajo de *Qué necesitás*, con su referencia: `POTA US-5584`,
  `IOTA EU-038`, `WWFF KFF-6494`...
- **La pestaña Referencias** (aparece cuando hay una Actividad elegida en el menú, y abre en ese programa): todas las cumbres, parques, islas y castillos que trabajaste (POTA,
  SOTA, WWFF, IOTA, WCA), programa por programa: cuántas trabajadas, confirmadas y confirmadas por
  QSL, y cada una con su nombre y lugar (listas de POTA y SOTA), las bandas en que la trabajaste,
  **C** confirmada / **W** trabajada, y tu último QSO con ella. Con buscador, y para ver todas,
  confirmadas, por QSL (QSL en papel) o sin confirmar; al hacer clic en una fila ves tus QSOs con
  ella (**✓** confirmado en LoTW, **✓ QSL** por tarjeta), y en POTA o SOTA también su tarjeta. Sale de tu log (QSOs que
  dicen la referencia: POTA_REF, SOTA_REF, WWFF_REF, IOTA, SIG_INFO, las referencias de Log4OM) y
  de tus QSOs con activadores que DX Agent vio en el aire. *Confirmada* quiere decir que un QSO
  con ella está confirmado en LoTW o por QSL; el crédito oficial de cada programa está en su sitio
  (pota.app, sotadata, wwff.co, iota-world.org). **IOTA** acredita una isla por QSL en papel, o
  por LoTW cuando la confirmación de LoTW dice la isla (la estación la puso en su ubicación de
  LoTW) o el país es un solo grupo de islas, así que no toda isla confirmada acá cuenta ahí: subí
  tu log en iota-world.org para ver cuáles reconoce. **Por QSL** muestra las que tienen QSL en
  papel (`QSL_RCVD` en tu log; en un log bajado de LoTW es la confirmación de LoTW, así que no
  cuenta como tarjeta). La lista de parques de POTA (`data/pota-parks.csv`, ~10 MB) se
  baja de nuevo cuando tiene un mes.
- **Tus parques y cumbres en el mapa:** el menú **Referencias**, al lado de DXCC / WAZ, muestra
  los parques POTA y/o las cumbres SOTA que trabajaste, en verde confirmadas y en ámbar trabajadas.
  Un clic en uno lo muestra en la pestaña Estación: su tarjeta de pota.app o SOTA y tus QSOs con él
  (un clic en uno abre esa estación), y en el mapa la ruta, el rumbo y la distancia desde tu QTH.
- **El parque o la cumbre en la pestaña Estación (POTA, SOTA):** al hacer clic en la fila, una
  tarjeta muestra lo que dicen pota.app o SOTA: su nombre, tipo y dónde queda (grid locator), si
  **vos** la trabajaste y en qué bandas (o "Nueva para vos"), cuántas activaciones y QSOs tiene,
  quién la activó primero, sus últimas activaciones (indicativo, fecha, QSOs por modo) y links a
  su página en pota.app o SOTA y al sitio del parque. Se consulta a api.pota.app y
  api2.sota.org.uk (públicas, sin login) al abrirla, y se guarda 30 minutos. Una referencia WWFF,
  IOTA o COTA tiene una tarjeta más chica, con lo que dice el spot: su nombre, y si la tenés en esa
  banda.
- **POTA y WWFF:** DX Agent lee además sus propias listas de quién está activando ahora
  (pota.app y wwff.co, cada 2 minutos). Cualquier spot de esas estaciones lleva su parque,
  incluso un spot de RBN de FT8 (RBN descarta el "POTA" de "CQ POTA"), y los activadores
  spoteados solo en esos sitios también aparecen ("(POTA)" en *Escuchado por*). La lista de
  SOTA de quién está en el aire pide registrarse en SOTA y una aprobación, así que SOTA se
  reconoce solo por el comentario.
- **Cumbres SOTA:** DX Agent guarda la lista de cumbres de SOTA (storage.sota.org.uk, se baja
  de nuevo cuando tiene un mes). Una referencia de cumbre cuenta solo si es una cumbre válida,
  salvo que quien la spoteó haya escrito "SOTA" antes (una cumbre más nueva que nuestra copia).
  Pasando el mouse sobre la activación se ve el nombre de la cumbre, su altura y sus puntos; los
  parques de POTA y WWFF muestran ahí su nombre también.
- **En el mapa:** las activaciones van en su cumbre (una montaña de cima dentada) o su parque (un pino),
  según la lista de SOTA y las de POTA y WWFF; con el color de cómo estás con esa referencia, igual
  que las capas DXCC y Referencias: rojo no trabajada, ámbar trabajada, verde confirmada (pasando
  el mouse se ve cuál). Se dibujan así solo con una Actividad elegida: con "ninguna", una
  estación en un parque o una cumbre es un punto como las demás, igual en su lugar.
- **Cumbres y parques nuevos:** con una Actividad elegida, una cumbre, parque, isla (IOTA) o
  castillo que no trabajaste **en esa banda** se marca *nueva*, aunque tengas el país confirmado:
  un spot que no generó alerta aparece como **REF NUEVA** ("referencia no trabajada en 20m"), la
  referencia dice *nueva*, el mapa la pinta como BANDA NUEVA y *Ocultar confirmados* no la
  esconde. Sin Actividad elegida no cambia nada. Lo que trabajaste sale de:
  - tu log, cuando el QSO dice la referencia: `SOTA_REF`, `POTA_REF` (un two-fer cuenta para
    cada parque), `WWFF_REF`, `IOTA`, `SIG` + `SIG_INFO`, y las referencias de premios de Log4OM.
    Una referencia POTA de antes de los prefijos de 2024 se lee como es ahora, según el país del
    QSO: el VE- de Canadá es CA- (VE-1596 es CA-1596) y el K- de EE. UU. es US-, con los mismos
    números. Una vieja que hoy es un parque de otro país (VE- es de Venezuela) y sin una referencia
    nueva conocida queda como dice el log, sin lugar en el mapa, y no cuenta para ningún parque;
  - lo que DX Agent vio en el aire: recuerda dónde estuvo cada activador y cuándo (los últimos
    32 días, en `data/dxagent.db`). Un QSO de tu log con esa estación a menos de 45 minutos
    de uno de sus spots cuenta para la cumbre o el parque en el que estaba, aunque tu programa de
    log no la haya anotado (con `/P` o sin). Esos QSOs se guardan para siempre en
    el mismo archivo. Solo conoce las activaciones que DX Agent vio: se completa
    de ahora en adelante.
- Los clusters no tienen un campo para esto: DX Agent lee el comentario del spot. Reconoce
  el nombre del programa (`POTA`, `WWFF`, `WCA`, `ILLW`, `JOTA`, `EME`...) y las referencias por
  su formato (`US-5584`, `KFF-6494`, `EU-038`, `LA/VF-010`, `DL-01121`). Un spot en el que quien
  lo publicó no escribió ninguna de las dos cosas no se reconoce como activación. Las
  estaciones con YOTA en el indicativo (GB23YOTA) cuentan como YOTA.
- Como los demás filtros, se guarda; **Limpiar filtros** lo apaga.

### CQ DX Marathon

El [CQ DX Marathon](https://dxmarathon.com) da un punto por cada país y uno por cada zona CQ
que trabajás: en el año (del 1 de enero al 31 de diciembre), o en el **Sprint**, diez días de
octubre (2026: del 17 al 26 de octubre). Activalo en Configuración → **CQ DX Marathon**,
elegí el anual o el Sprint (y sus fechas) y los modos que cuenta tu participación. Entonces:

- Una pestaña **Marathon** al lado de DXpediciones muestra el período, tu puntaje (países +
  zonas), las 40 zonas CQ (en verde, las trabajadas) y los países: **Trabajados**, con el QSO
  que cuenta (el primero del período: indicativo, fecha, banda, modo; con un clic se abre la
  estación), o **Faltan**, los que te quedan. El buscador encuentra un país por nombre o
  prefijo. El número de la pestaña es tu puntaje.
- Una estación que te suma un país o una zona avisa como **MARATHON** (violeta), aunque sea
  de un país que tenés confirmado para el DXCC, y la columna "Qué te falta" dice qué suma
  ("Marathon: país nuevo (Sicily), zona 15"). Cada tipo se puede apagar en Configuración. No
  se repiten por país (o zona), banda y modo: con una estación de Sicilia alcanza. El filtro
  **MARATHON** y la pestaña aparecen solo mientras seguís el Marathon.
- La pestaña Estación dice, para cualquier indicativo, su país y su zona del Marathon, y si
  los trabajaste en el período y cuándo.
- Todo sigue a tu log: un QSO que logueás (archivo, base de Log4OM, UDP) cuenta enseguida.

Qué cuenta, según las reglas:

- **Países:** la lista CQ DX Countries, las entidades DXCC más seis países WAE: Sicilia
  (IT9), Italia africana (IG9/IH9), Shetland (GM/s), Turquía europea (TA1), Isla del Oso
  (JW/b) y el Centro Internacional de Viena (4U1VIC). El país de un QSO es el `REGION` de
  ADIF si tu programa de log lo escribió, si no el campo `DXCC`, convertido en país WAE
  cuando el indicativo es de uno (según el archivo de países de AD1C).
- **Zonas:** el `CQZ` del QSO o, si no está, la zona del indicativo en el archivo de AD1C
  (que sabe que W0 es zona 4 y VE7 zona 3). Una estación de EE. UU., Canadá o Rusia puede
  estar en otra zona que la de su indicativo: para un spot, la zona que se muestra es la del
  indicativo.
- **Indicativos:** el principal, o los que marques en la tarjeta (hasta 2, ver Varios
  indicativos).
- **Bandas y modos:** de 160 a 6 m; sin satélites, repetidoras ni enlaces por internet; sin
  /MM ni /AM. Modos: todos, o solo CW, fonía o digital, o la clase **Classic** del Sprint
  (CW y fonía).
- El Marathon anual es el año UTC en curso; hasta el 5 de enero (el plazo para mandar el
  log) sigue siendo el del año anterior. DX Agent no envía tu participación: subí tu ADIF en
  [entry.dxmarathon.com](https://entry.dxmarathon.com).

### Mapa mundial

Hacé clic en **Mapa** (al lado de **Lista**, a la izquierda de los filtros) para ver las
mismas alertas en un mapa del mundo. Los filtros valen para las dos vistas.

- **Los puntos** son alertas, con el color de su tipo. La posición de la estación sale del
  grid locator que informa la RBN en los spots de FT8/FT4; si no, es el centro del país
  (marcado "aprox." en el detalle). Pasá el mouse para ver los datos y hace cuánto la
  spotearon, y hacé clic para seleccionarla. Como en la lista, un punto se atenúa a los 10
  minutos del último spot de la estación en esa banda y modo, y más a los 30: un punto
  atenuado es donde estuvo, no donde está.
- **Hacé clic en un país** (en cualquier parte, o cerca de una isla chica) para verlo en la
  pestaña Estación, como cuando consultás un indicativo: su tarjeta, los rumbos a su centro,
  el estado, el cuadro del CQ DX Marathon y la grilla banda × modo.
- **Los rombos** son DXpediciones activas: rojo = ATNO, ámbar = sin confirmar, turquesa = tenés
  el país pero en menos de la mitad de tus bandas, gris = ya la tenés. Si tienen una alerta de
  los últimos 15 minutos, el rombo toma el color de la alerta. Un **borde verde** quiere decir
  que la spotearon en los últimos 15 minutos (está en el aire). La leyenda abajo a la izquierda
  lo resume (su chevron la pliega a una palabra, "Leyenda", y el navegador lo recuerda). Si hay varias en el mismo lugar (por ejemplo cuatro en Koror, Palau), cada una va en
  un círculo chico alrededor, con su propio clic, y las que están en el aire quedan arriba. Cuáles
  se ven: el menú **DXpediciones** (al lado de DXCC / WAZ / Referencias): las que están **en el
  aire** (de fábrica), **las que faltan** (como "solo las que faltan" de la pestaña), **todas** las
  activas, o **no**; la estación abierta en la pestaña Estación se ve siempre, y el navegador lo
  recuerda.
- **Punto azul:** tu QTH, según tu grid locator.
- **Zona sombreada:** donde es de noche ahora (su borde es la línea gris); se actualiza cada minuto.
- **Estación seleccionada:** la ruta de círculo máximo punteada desde tu QTH, el **rumbo
  de antena** (y el paso largo) y la distancia, y puntitos para cada receptor que la
  escuchó en los últimos 15 minutos (verde = cerca tuyo).
- **Zoom** con la rueda del mouse o los botones **+ / −**, **arrastrar** para moverse y
  **⟲** para ver el mundo entero. Al hacer zoom aparecen los indicativos de todas las estaciones;
  donde se pisarían, se muestran los más importantes (pasá el mouse por un punto para ver su indicativo).
- La pestaña Estación también muestra los dos **rumbos**, grandes, cada uno con una brújula
  que apunta hacia ahí y su distancia: el paso corto en azul y el paso largo (dando la vuelta
  al mundo por el otro lado) en naranja, en cualquiera de las dos vistas.
- Las fronteras son las **DXCC**, no solo las de los países: también están separadas la Rusia
  europea y la asiática, Inglaterra, Escocia y Gales o el Monte Athos. Pasá el mouse por el
  mapa para ver qué entidad es. Cada entidad muestra su prefijo cuando entra en pantalla
  (hacé zoom para ver los de las chicas).
- Las costas y las fronteras de los países salen de Natural Earth 1:50m (dominio público); las
  entidades DXCC y las fronteras que los países no tienen, del mapa DXCC de GridTracker
  (licencia BSD). Se descargan la primera vez que abrís el mapa y se guardan en
  `data/world-countries-50m.json` y `data/dxcc-shapes.json`.
- Un link directo al mapa: `http://localhost:8073/?view=map`.

#### Tu DXCC en el mapa

El menú **DXCC**, arriba a la izquierda del mapa, pinta cada entidad según cómo vas en un
diploma: **verde** = confirmada, **ámbar** = trabajada pero sin confirmar, **rojo** = no
trabajada. Al lado dice cuántas tenés confirmadas y trabajadas, sobre las entidades actuales.
Pasá el mouse por una entidad para ver su estado. Elegí el diploma en el primer menú y, para
Mixto, Fonía, CW o Digital, una banda en el segundo:

- **Mixto**, **Fonía**, **CW**, **Digital** con *todas las bandas*: esos diplomas;
- **Mixto** y una banda: el diploma de esa banda (de 160 a 6 m siempre; 2 m, 70 cm y más
  arriba cuando las trabajaste);
- **Fonía**, **CW** o **Digital** y una banda, por ejemplo **CW** y **40 m**: tus slots en esa
  banda y modo. No es un diploma de la ARRL, pero así se persiguen los slots;
- **Satélite**;
- **Sigue a los filtros de arriba de la lista:** con *todas las bandas* (o **Mixto**) acá y una
  sola banda (o un solo modo) elegidos en los filtros, por ejemplo 12 m y DIGI, la capa pinta esa
  banda y ese modo, igual que los puntos; los menús dicen entonces "12 m (filtro)", "Digital
  (filtro)". Una banda o un modo elegidos acá tienen prioridad. La capa WAZ sigue la banda de la
  misma forma;
- **Challenge (160–6 m)**: cuantas más bandas confirmadas, más verde (de 0 a 10); el total
  cuenta banda-entidad, como el DXCC Challenge.

Sigue las reglas del DXCC de la ARRL (arrl.org/dxcc-rules):

- Confirmada quiere decir **LoTW o QSL en papel** recibida (QSL_RCVD); eQSL no cuenta. Una
  tarjeta recibida no está acreditada hasta que la revisa la ARRL o un card checker, así que
  tus totales en la ARRL pueden ser menores.
- Los QSOs por satélite (PROP_MODE SAT) cuentan solo para Satélite; los de repetidoras e
  internet (RPT, INTERNET, ECH, IRL), los de 60 m y las estaciones en barcos o aviones (/MM,
  /AM) no cuentan; los QSOs anteriores al 15/11/1945 no cuentan, y el CW anterior a 1975
  cuenta solo para Mixto.
- Solo cuenta la lista DXCC actual: las entidades eliminadas quedan afuera, acá y en los totales
  de trabajados y confirmados del encabezado (el DXCC de un QSO viejo, como lo informa LoTW, puede
  ser una: 85 Antillas Neerlandesas, 151 Malyj Vysotskij).
- No revisa desde dónde operaste ni con qué indicativo: cuenta todo QSO de tu log.

Las entidades chicas (islas, microestados, enclaves como el Vaticano o Guantánamo) llevan además
un halo de su color, para verlas sin hacer zoom.

#### Tu WAZ en el mapa

Elegí **WAZ** en el primer menú (en lugar de DXCC) para pintar las 40 **zonas CQ** según
cómo vas en el Worked All Zones de CQ: el mismo verde / ámbar / rojo, cada zona con su número
y sus bordes. Pasá el mouse por una zona para ver su nombre y su estado. Elegí el diploma:

- **Mixto, SSB, CW, RTTY, AM**; **SSTV** (QSOs desde 1973); **Digital** (desde 2000, sin
  RTTY, que tiene su propio diploma);
- un modo y una banda, por ejemplo **CW** y **40 m** (80-10 m desde 1973; 30, 17 y 12 m desde
  1991), o **Mixto** y una banda (160 m desde 1975, 30 zonas para pedirlo; 6 m, 25 zonas);
  de 2 m para arriba cuentan solo los QSOs por EME;
- **Satélite** (desde 1989, 25 zonas) y **EME** (desde 1973, 25 zonas);
- **5BWAZ**: las 40 zonas en cada una de 80, 40, 20, 15 y 10 m, cualquier modo, QSOs desde
  1979: cuantas más bandas confirmadas, más verde; el total cuenta banda-zona (200; el
  diploma básico es con 150).

Sigue las reglas de CQ (n4baa.com/9_Rules.pdf, agosto 2026):

- Confirmada quiere decir **LoTW, QSL en papel o eQSL** (WAZ acepta eQSL; DXCC no).
- La zona es la que tu programa de log guardó con el QSO (CQZ en el ADIF) o, si falta, la de
  la entidad según cty.csv. En países con varias zonas (EE. UU., Canadá, Rusia, Brasil, China,
  Australia...) revisá que tu programa la complete.
- Barcos y aviones (/MM, /AM), repetidoras e internet nunca cuentan; los QSOs anteriores al
  14/11/1945 tampoco.
- No se controla que hayas operado desde una sola entidad DXCC, ni las categorías
  Tradicional / Remota.

#### El mapa azimutal (tu QTH en el centro)

El primer menú de la barra del mapa elige cómo muestra el mundo: **Rectangular** (el de siempre) o
**Azimutal**: azimutal equidistante, centrado en tu grid locator (Configuración → Grid locator, o el
MY_GRIDSQUARE de tu log; sin uno la opción aparece desactivada). El camino corto a cualquier
estación es una línea recta desde el centro: su **rumbo** es el ángulo, con el norte arriba, y su
**distancia** el radio, con círculos cada 2.500 km (rotulados cada 5.000) y los rumbos cada 30°
alrededor del borde. El borde es tu antípoda: las tierras cercanas a él se estiran a lo largo del
borde, como en cualquier mapa azimutal.

Tiene todo lo del mapa rectangular: las vistas DXCC, WAZ y Grillas con sus menús, las zonas CQ, la
capa Referencias, los prefijos de los países, la noche (línea gris), tu QTH, las alertas y las
DXpediciones (con los filtros de arriba de la lista), las estaciones en el aire en su grid y la
estación elegida, con su camino recto, rumbo y distancia. Bajo el mouse, una línea punteada desde
tu QTH dice el rumbo y la distancia a ese punto ("47° · 9.850 km"), y en la vista Grillas aparece
la ficha del grid como en el mapa rectangular. Un clic en un país lo abre en la pestaña Estación;
la rueda, **+ / −** y arrastrar hacen zoom y mueven, **⟲** vuelve a mostrar el mundo entero. El
navegador recuerda la elección.

Se dibuja con d3-geo (https://d3js.org, licencia ISC), que viene dentro de DX Agent
(`dxagent/static/vendor/`, con su licencia): no se baja nada para esto.

#### Tus grids en el mapa (como GridTracker)

Elegí **Grillas** en el primer menú (en lugar de DXCC o WAZ) para ver la grilla Maidenhead:
los 324 fields (FN, GF...) con sus líneas y nombres, y con zoom los grids (FN31) con los suyos.
Los grids que trabajaste se pintan: verde confirmado, ámbar trabajado. Elegí qué cuenta:

- **Mixto, Fonía, CW, Digital**, y una banda: **6 m** para el FFMA, una banda para el VUCC
  (todas las bandas por defecto); una banda o un modo elegidos en los filtros de arriba de la
  lista se usan mientras los menús digan "todas las bandas" o Mixto, como en el DXCC;
- **Satélite**: los QSOs por satélite (PROP_MODE SAT), que no cuentan para ninguna banda.

El resumen dice cuántos grids tenés confirmados y trabajados, y en cuántos fields. Pasá el
mouse por un grid para ver qué tenés ahí (cada banda y modo, ✓ confirmado) y quién está en el
aire en él.

**En el aire** (marcado por defecto) pone en su grid a las estaciones oídas con locator en los
últimos 15 minutos, con alerta o sin ella, como GridTracker: las que decodifica tu WSJT-X (su
CQ dice el locator) y los spots de FT8/FT4 de la RBN, en las bandas y modos en que alertás. Un
grid con borde **rojo** es uno que no trabajaste en la banda de esa estación; con borde verde,
uno que ya tenés. Sus indicativos se ven con zoom; con un clic se abre la pestaña Estación.

Sigue las reglas del VUCC: confirmado quiere decir **LoTW o QSL en papel** (eQSL no cuenta),
y las repetidoras e internet nunca cuentan. El grid es el GRIDSQUARE del QSO (sus primeros 4
caracteres), y cada grid de VUCC_GRIDS para una estación sobre una línea o una esquina. Las
confirmaciones de LoTW traen el locator de la otra estación, así que confirman su grid. Un QSO
que tu programa guardó sin locator no cuenta para ningún grid.

Para que te avise cuando sale un grid nuevo, marcá **Grid nuevo** en **Avisarme de** en la
configuración (desactivada por defecto): una alerta **GRID NUEVO** por una estación en un grid
que no trabajaste en esa banda, en cualquier modo. Solo pueden avisar los spots que dicen el
locator: los decodes de tu WSJT-X y los spots de FT8/FT4 de la RBN, no los del DX cluster.

**Zonas CQ** (la casilla del menú) muestra los bordes y números de las zonas en cualquier
vista, con DXCC o sin nada.

### Seguridad

- El panel solo escucha en `127.0.0.1`, así que otras computadoras no pueden
  acceder.
- Solo responde a pedidos dirigidos a `localhost` (protección contra trucos de
  *DNS rebinding* desde sitios web).
- La configuración solo se puede guardar desde la propia página del panel. Otros
  sitios web que visites no pueden enviar un pedido que la modifique ni mostrar el
  panel dentro de su propia página.
- El texto de los spots (los comentarios del cluster los escribe cualquiera en
  internet) siempre se muestra como texto plano, nunca se ejecuta como código.

---

## 3. Página de configuración

Hacer clic en **Configuración** en el encabezado (o abrir
`http://localhost:8073/#settings`). Cambiar lo necesario y hacer clic en **Guardar y
aplicar**: el agente reescribe `config.toml`, vuelve a cargar el log y reconecta las
fuentes en pocos segundos. No hace falta reiniciarlo. La configuración está en pestañas, un
grupo a la vez (se recuerda la que estaba abierta); la pestaña **Log** solo aparece con el
logbook de DX Agent como tu log.

| Sección | Qué se puede configurar |
|---------|-------------------------|
| **Estación** | Tu indicativo; **Tu log**: un archivo ADIF de tu logger, **Solo LoTW** (ver LoTW como log), o **Empezar de cero** (ver Un log nuevo); la ruta del log ADIF (una por línea; `*` elige el archivo más nuevo, por ejemplo `…/CALL_*_backup.adi` para los backups de Log4OM). **Buscar…** abre la ventana de archivos de Windows para elegirlo (si elegís un backup de Log4OM con fecha, se convierte en `…/CALL_*_backup.adi` para usar siempre el más nuevo). **Probar** muestra qué archivo encontró, su tamaño, fecha y cantidad de QSOs; tu grid locator (vacío = se toma de tu log); **Tus otros indicativos**, cada uno con su log (ver Varios indicativos) |
| **Log** | Solo con el logbook de DX Agent: **Importar ADIF…**; TQSL (dónde está) y la ubicación de estación de TQSL de cada indicativo, para subir a LoTW; tu email de Club Log y la contraseña de aplicación, para subir a Club Log; la API key de QRZ.com de cada indicativo (con **Probar**), para subir y bajar de QRZ (ver El logbook de DX Agent) |
| **LoTW** | Activar o desactivar la descarga de confirmaciones; usuario de LoTW (vacío = tu indicativo); contraseña de LoTW; cada cuánto descargar. **Probar ingreso** prueba el usuario y la contraseña con LoTW |
| **Alertas** | Qué tipos de alerta querés (y **Tu propio indicativo**: quién te escucha; un tipo que apagás también sale de la lista: una alerta que era solo de ese tipo se va, y otra muestra su siguiente título, BANDA NUEVA en vez de INDICATIVO NUEVO); bandas; modos; cuándo una DXpedición o un indicativo de la lista de seguimiento cuenta como trabajado; **Lista de seguimiento**; **Ignorar**; cuánto esperar antes de repetir la misma alerta y **Dejar solo la última fila de cada estación** (mismo indicativo, frecuencia y modo: cuando vuelve a aparecer, sus filas anteriores salen de la lista); **Quitar de la lista después de** N minutos (las estaciones que no se spotean en esa banda y modo durante ese tiempo salen de la lista; 0 = nunca, el valor por defecto); el radio de "cerca tuyo" y **Avisar solo si se escucha cerca tuyo**; notificaciones de Windows y para qué alertas |
| **Fuentes de spots** | DX cluster activado o no, sus servidores (`servidor:puerto`, en orden) y comandos al conectar; **Spots recientes al conectar** (minutos, 0 = no); de qué continentes tomar los spotters del cluster; RBN activada o no, fuentes CW/RTTY y FT8/FT4; de qué continentes cuentan los skimmers |
| **Radio (botón Sintonizar)** | Qué programa sintoniza la radio (Desactivado, Log4OM 2, N1MM Logger+, DXLog.net, OmniRig, Hamlib rigctld, flrig, DXLab Commander, TCI), su dirección y puerto (0 = por defecto), si también cambia el modo, qué radio de OmniRig, y con TCI si las alertas van al panadaptador y qué hace Sintonizar mientras la radio transmite |
| **CQ DX Marathon** | Seguirlo o no; el anual o el Sprint, y las fechas del Sprint; los modos que cuentan (todos, CW, fonía, digital, o Classic: CW y fonía); alertas por país nuevo y por zona nueva del Marathon |
| **Aperturas en VHF** | Vigilar las estaciones cerca tuyo que escuchan lejos, y las estaciones que te escuchan; las bandas (6 m, 2 m); a qué distancia es cerca; cuántas estaciones tienen que escucharla, y cuántas de ahí; qué es un lugar (un país, un continente, un campo de grilla); a qué distancia mínima, y el tiempo de vida, para cada banda; dejar afuera el rebote lunar; un aviso de Windows cuando abre la banda (ver Aperturas en VHF) |
| **DXpediciones, log y panel** | Mostrar DXpediciones que ya tenés; fuentes de DXpediciones y cada cuánto releerlas; cada cuánto revisar el archivo del log; puerto del panel; abrir el navegador al iniciar |

Cómo se comporta:

- **Revisión antes de guardar.** Un indicativo que no parece válido, una ruta de log
  vacía, ninguna banda elegida, un servidor de cluster sin `:puerto` y errores
  similares se listan en rojo, y no se guarda nada hasta corregirlos.
- **Copia de respaldo.** El archivo anterior se conserva como `config.toml.bak`.
- **La contraseña de LoTW** se guarda cifrada para tu usuario de Windows en
  `data/lotw.secret`, nunca en `config.toml`, y no se vuelve a mostrar. El cuadro
  indica si hay una contraseña guardada. Si se deja vacío, se conserva la guardada;
  marcando **Olvidar la contraseña guardada** se elimina.
- **El puerto del panel** cambia recién la próxima vez que se inicie DX Agent.
- **Comentarios.** Al guardar, `config.toml` se reescribe con sus propios
  comentarios breves; los comentarios agregados a mano no se conservan.

---

## 4. Comandos

Todos los comandos se ejecutan desde la carpeta del proyecto como
`python -m dxagent <comando>`. `run` es el comando por defecto.

| Comando                 | Qué hace                                                                          |
|-------------------------|-----------------------------------------------------------------------------------|
| `run`                   | Vigila el cluster y la RBN, sirve el panel y avisa de las estaciones necesitadas hasta Ctrl+C |
| `dxpeditions --days 30` | Lista las DXpediciones activas y las que empiezan en los próximos N días, con tu estado y LoTW para cada una |
| `check INDICATIVO`      | Muestra la grilla trabajado/confirmado del país de ese indicativo, por banda y modo |
| `stats`                 | Cuenta los países trabajados y confirmados por banda y por modo                   |

Para ejecutar las pruebas:

```powershell
python -m unittest discover -s tests -t .
```

### Ejemplo de `check`

`C` = confirmado (LoTW o QSL en papel), `W` = trabajado pero no confirmado,
`.` = no trabajado.

```text
VP2MAW: Montserrat (DXCC 96, NA, CQ 8) - no LoTW
          160m   80m   40m   30m   20m   17m   15m   12m   10m    6m
      CW     .     .     .     .     C     C     W     .     C     .
   PHONE     .     .     .     .     C     .     .     .     .     .
    DIGI     .     .     .     .     .     .     C     .     .     .
  C = confirmed (LoTW/QSL)   W = worked, not confirmed   . = not worked
  this call: not in log
```

### Columna de estado de `dxpeditions`

- `NEED: ATNO`: país nunca trabajado.
- `NEED: not confirmed`: trabajado, pero sin confirmación en ninguna banda.
- `have: 4 bnd, 2 cfm`: trabajado en 4 bandas, confirmado en 2. `(wkd 15,20)` indica
  que ya trabajaste ese indicativo de la DXpedición en esas bandas.

La columna LOTW muestra la fecha de la última subida de la estación, `LoTW announced`
(el listado de la DXpedición dice QSL vía LoTW pero todavía no subió nada) o `no LoTW`.

### Ejemplo de `stats`

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

## 5. Cómo leer las alertas

Cada alerta es una fila en el panel y una línea en la terminal: hora (UTC), título,
indicativo, frecuencia (kHz), banda, modo, país y luego detalles separados por `|`.
Con el panel en español los títulos y el detalle aparecen traducidos (por ejemplo
**BANDA NUEVA**, "banda nueva"); la terminal y las alertas guardadas en `data/dxagent.db`
siempre usan los nombres en inglés.

```text
14:56Z DXPED NEED  VP2MAW   18095.0   17m FT8   Montserrat   NEED: 17m DIGI never worked | until 10-20 | no LoTW | rbn NG7M -14dB
14:55Z DXPED HAVE  VP2MAW   14030.0   20m CW    Montserrat   have it: 20m CW confirmed | until 10-20 | no LoTW | rbn WE9V 7dB 27wpm
14:55Z NEW BAND    SV2GNJ   18100.0   17m FT8   Greece       LoTW 2022-05-10 | rbn WZ7I -8dB
```

- **El modo** viene de la RBN o del comentario del cluster. Cuando hay que deducirlo
  del plan de bandas se muestra con `?`, por ejemplo `CW?`.
- **El último detalle:** `rbn SPOTTER SNR WPM` para los spots de skimmers, o
  `de SPOTTER: comentario` para los del cluster.
- **Los corchetes** al final listan todos los motivos cuando hay más de uno, por
  ejemplo `[new_band, new_mode]`.

### Tipos de alerta

| En el panel (ES)  | En la terminal / EN | Significado                                                        | Por defecto |
|-------------------|---------------------|--------------------------------------------------------------------|-------------|
| ATNO              | ATNO                | País nunca trabajado                                               | activada    |
| DXPED FALTA       | DXPED NEED          | DXpedición activa que te suma un país, banda, modo o combinación banda+modo nuevos | activada |
| DXPED CONFIRMAR   | DXPED CFM           | DXpedición activa de un país que trabajaste pero no confirmaste en esta banda o modo | activada |
| DXPED YA TENGO    | DXPED HAVE          | DXpedición activa que ya tenés confirmada en esta banda y modo (gris, sin notificación) | activada |
| BANDA NUEVA       | NEW BAND            | País trabajado, pero no en esta banda                              | activada    |
| MODO NUEVO        | NEW MODE            | País trabajado, pero no en este grupo de modos (CW, FONÍA, DIGI)   | activada    |
| SIGUIENDO         | WATCHLIST           | Un indicativo de tu lista de seguimiento, todavía no trabajado     | activada    |
| BANDA+MODO        | NEW SLOT            | País no trabajado en esta combinación de banda y modo              | desactivada |
| GRID NUEVO        | NEW GRID            | Grid no trabajado en esta banda, en cualquier modo (VUCC, FFMA). Solo los spots que dicen el locator: los decodes de tu WSJT-X y FT8/FT4 de la RBN (ver Tus grids en el mapa) | desactivada |
| PREFIJO NUEVO     | NEW PREFIX          | Un prefijo que nunca trabajaste, en ninguna banda ni modo, como los cuenta el diploma CQ WPX: las letras y números hasta el último número antes del sufijo (LU1ABC: LU1, HG19ABC: HG19), y en un portable el otro prefijo (N8BJQ/KH9: KH9, PA/N8BJQ: PA0, N8BJQ/7: N7; /P, /M, /QRP no cuentan). Lo dice Qué te falta ("prefijo N1 nunca trabajado") y la pestaña Estación ("Prefijo N1: PREFIJO NUEVO", o trabajado). Muchas menos que INDICATIVO NUEVO: cuando trabajás una estación de un prefijo, las demás de ese prefijo no avisan | desactivada |
| INDICATIVO NUEVO  | NEW CALL            | Este indicativo exacto no está en tu log (genera muchísimas alertas) | desactivada |
| MARATHON          | MARATHON            | Un país o una zona CQ que todavía no trabajaste en el CQ DX Marathon (ver CQ DX Marathon) | activada, mientras sigas el Marathon |
| TE ESCUCHAN       | YOU'RE HEARD        | Spotearon tu propio indicativo (cualquiera de los tuyos, en cualquier banda y modo): el cluster, la RBN o, con PSKReporter en vivo, un receptor de PSKReporter (cada uno una vez por banda cada 5 minutos: en FT8 reporta cada CQ): quién te escucha y a qué distancia, en Qué te falta ("te escuchan a 8.912 km, en United States"); la fila va resaltada en rosa y sigue al último spot (×N skimmers). Al hacer clic se ven todos los receptores que te escucharon, del más cercano al más lejano, y en el mapa | activada (`alerts.self_spots`) |
| 50 MHz, 144 MHz   | OPEN                | 6 m o 2 m abierta (su filtro: 50-144 MHz): estaciones cerca tuyo escuchan estaciones lejanas, o estaciones lejanas te escuchan a vos (ver Aperturas en VHF); resaltada en verde | desactivada (`vhf.near`, `vhf.self`) |

"Por defecto" se refiere a **Avisarme de** en la página de configuración
(`alert_on` en el archivo).

La lista y el mapa guardan las últimas 500 alertas. Cuando la lista se llena, se van primero las
menos importantes: las INDICATIVO NUEVO y DXPED YA TENGO más viejas, o cualquier alerta de más de
una hora. Las demás (ATNO, banda, modo o banda+modo nuevos, DXpediciones, seguimiento, Marathon)
quedan al menos una hora, así INDICATIVO NUEVO, que puede traer cien alertas por minuto, no las
saca.

Cuando cambia tu log (trabajaste la estación), las alertas que ya están en la lista lo siguen: el
motivo que ya no vale se va (una BANDA+MODO que después trabajaste deja de serlo, y de aparecer
con ese filtro), y con él el título, el color y "Qué te falta". Una DXpedición sigue siéndolo:
DXPED FALTA, CONFIRMAR o YA TENGO según lo que todavía te suma. Una alerta sin ningún motivo
queda como **TRABAJADO** (en gris).

### De dónde salen las DXpediciones

Se unen tres fuentes públicas por indicativo (se eligen en Configuración →
**Fuentes de DXpediciones**; las tres vienen activadas):

| Fuente | Qué aporta |
|--------|------------|
| **NG3K ADXO** | El calendario más conocido de operaciones anunciadas, con fechas, ruta de QSL y notas |
| **425 DX News** | El calendario del boletín semanal italiano: muchas operaciones que NG3K todavía no lista. Quedan afuera los indicativos especiales y de aniversario |
| **Club Log** | Las expediciones que están subiendo su log a Club Log ahora (un log actualizado en los últimos 3 días cuenta como en el aire), el link para buscar tus QSOs en el log y pedir la QSL por OQRS, y el puesto en el **Most Wanted** de DXCC |

Si el mismo indicativo está en más de una fuente, la ruta de QSL y las notas salen primero de
NG3K y después de 425 DX News, y la operación dura hasta la última fecha que dé cualquiera de
ellas: si el boletín la anuncia para octubre y después para noviembre, o la extiende, sigue
avisando hasta el final. Club Log suma su link y, como sus fechas son QSOs reales, puede
estirar las fechas. El mismo indicativo en dos viajes distintos (ahora y el año que viene, o
en otra isla: VY0ZOO en NA-007 y después en NA-174) queda como dos entradas. Cada tarjeta de la
pestaña DXpediciones muestra sus fuentes y el puesto en el Most Wanted; la pestaña Estación
tiene el link a cada fuente y al log de Club Log.

**Orden.** **En el aire** pone primero las DXpediciones spoteadas en los últimos 15 minutos, la del spot más reciente arriba, y el resto por Most Wanted; la que pasa 15 minutos sin spots vuelve a su lugar. **Most Wanted** (el que viene elegido) pone primero los países más buscados, según el puesto de Club Log, y al final los que no tienen puesto; **Fecha** ordena por la fecha de inicio anunciada. El navegador recuerda tu elección. 425 DX News a
veces da solo el fin ("till 31/10"); entonces el inicio se lee del texto del boletín
("from 20 September to…", "on 8-11 October", "between 7 and 21 October"). Si el texto
tampoco lo dice, la tarjeta muestra **hasta 10-31** y va primero, porque ya está activa.

**En el aire.** Una DXpedición spoteada (cluster o RBN) en los últimos 15 minutos se
marca con un borde verde y una línea **EN EL AIRE** con la frecuencia (clic para
sintonizar), banda, modo, hace cuánto y quién la spoteó. La pestaña DXpediciones muestra
cuántas hay en el aire (**● 4**) aunque estés mirando la pestaña Estación, el mapa marca
sus rombos, y aparece un aviso en el panel apenas una sale al aire. Pasa con todas las
DXpediciones activas, las necesites o no y estén o no en tu lista de seguimiento;
**solo las que faltan** nunca oculta una que está en el aire.

### ¿Estás en su log?

Cuando abrís una DXpedición activa en la pestaña Estación y su log está en Club Log, el
recuadro de la DXpedición busca tu indicativo en el buscador de log de Club Log: los
casilleros de banda y modo donde estás en su log (✓), los que ya activaron y te faltan (·),
y dos avisos: **en tu log pero no en el de ellos** (un indicativo mal copiado, un QSO que no
anotaron o un día que todavía no subieron: se muestra la fecha de la última subida) y **en
su log pero no en el tuyo** (un QSO que te falta cargar). Solo consulta cuando abrís esa
estación y guarda la respuesta 10 minutos; dice a qué hora consultó. ¿Recién los trabajaste?
**↻ Actualizar** vuelve a consultar Club Log en el momento (tu QSO aparece ahí cuando lo suben). Muchas DXpediciones no usan Club Log: en ese
caso muestra las direcciones web de su anuncio (NG3K, 425 DX News), donde suele estar su
propio buscador de log u OQRS.

### ¿Necesito esta DXpedición?

La columna **Qué te falta** del panel (en la terminal, el texto después de `NEED:`)
dice exactamente qué suma trabajarla, lo más importante primero:

| En el panel (ES)                                       | En la terminal / EN                    | Significado                                |
|--------------------------------------------------------|----------------------------------------|--------------------------------------------|
| `ATNO`, `banda nueva`, `modo nuevo`                    | `ATNO`, `new band`, `new mode`         | Algo que nunca trabajaste                  |
| `17m DIGI nunca trabajado`                             | `17m DIGI never worked`                | Tenés la banda y el modo, pero no juntos   |
| `país no confirmado`, `banda no confirmada`, `modo no confirmado` | `entity not confirmed`, `band not confirmed`, `mode not confirmed` | Trabajado, pero sin LoTW ni QSL en papel (eQSL no cuenta) |
| `ya lo tenés: 20m CW confirmado`                       | `have it: 20m CW confirmed`            | Nada nuevo: trabajarla solo si se quiere   |

El título lo resume: **DXPED FALTA** cuando hay algo nuevo, **DXPED CONFIRMAR** cuando
lo que se gana es una confirmación, **DXPED YA TENGO** cuando no se gana nada.

### Colores y notificaciones

| Prioridad | Color          | Notificación | Alertas                                                       |
|-----------|----------------|--------------|---------------------------------------------------------------|
| 1         | blanco en rojo | sí           | ATNO                                                          |
| 2         | amarillo       | no           | BANDA NUEVA; DXPED FALTA/CONFIRMAR por banda o modo nuevos, o país no confirmado |
| 3         | celeste        | no           | MODO NUEVO, SIGUIENDO, GRID NUEVO, PREFIJO NUEVO; DXPED por banda+modo nuevos o banda/modo no confirmados |
| 4         | verde          | no           | BANDA+MODO; DXPED por banda+modo no confirmados               |
| 5         | gris           | no           | INDICATIVO NUEVO, DXPED YA TENGO                              |

La columna de notificación es la configuración por defecto
(`notify_max_priority = 1`): por defecto solo ATNO muestra notificación. Para que también
la muestren las de prioridad 2 o 3, se cambia en **Notificaciones de Windows** en la página de
configuración. Cada alerta también se guarda en
`data/dxagent.db` (los últimos `keep_days` días).

### Cerca tuyo: ¿la estación está llegando a tu zona?

Una señal fuerte en otro continente no sirve de mucho si no llega hasta vos. DX Agent
registra **todos** los spots de la RBN y del cluster (no solo los que generan
alerta) junto con la ubicación de quien los recibió, y en cada alerta muestra la
estación más cercana a vos que la escuchó en esa banda en los últimos 15 minutos:

| Se muestra | Significado |
|------------|-------------|
| **● 732 km · 7 dB** (verde) | Se escucha cerca tuyo: una estación dentro de tu radio "cerca" (1.500 km por defecto) la escuchó, con esa SNR |
| **8.176 km** (gris) | Solo se escucha más lejos; ese es el receptor más cercano |
| **—** | Sin reportes de la RBN ni del cluster en los últimos 15 minutos |
| **~** antes de la distancia | Aproximado: un spotter del cluster ubicado en el centro de su país |

- **Dónde están los receptores:** los skimmers de la RBN salen de la lista de skimmers
  de la propia RBN, con grid locator exacto, descargada una vez por día. Los spotters
  del cluster se ubican en el centro de su país, según `cty.csv`.
- **Tu ubicación:** el grid locator de la configuración. Si está vacío, se toma de
  `MY_GRIDSQUARE` en tu log.
- **Actualización:** la columna se refresca cada 20 segundos, porque los receptores
  cercanos suelen reportar una estación un poco después del primer spot.
- **Filtro o ajuste:** el botón **Solo cerca tuyo** solo *oculta* las alertas que no se
  escuchan cerca tuyo: siguen avisando, y vuelven a verse al desmarcarlo. **Avisar solo si se
  escucha cerca tuyo**, en la configuración, decide qué *avisa*: una estación que solo se
  escucha lejos no avisa nunca (no entra a la lista ni hay notificación) hasta que alguien
  cerca tuyo la escucha. Donde hay pocos receptores cerca (el sur de Sudamérica, por ejemplo)
  eso descarta casi todos los spots y la lista queda casi vacía: entonces el panel dice, junto
  a cuántas se listan, cuántas estaciones no avisaron en la última hora ("1.240 no avisaron:
  solo se escuchan lejos"; con un clic se abre la configuración). Casi siempre lo que conviene
  es el filtro.
- **Pestaña Estación:** **Quién lo escucha** lista los receptores más cercanos a vos
  primero, con banda, SNR y antigüedad. **Consultar PSKReporter (FT8/FT4)** le
  pregunta a PSKReporter, que tiene muchos más receptores de FT8 en Sudamérica que
  skimmers la RBN. Sus recepciones se suman a "cerca tuyo", así que el resumen y la
  columna de la tabla también se actualizan. La respuesta se guarda 5 minutos por
  indicativo. PSKReporter pide **como máximo una consulta cada 5 minutos** (para todas
  las estaciones juntas) y bloquea las conexiones que consultan más seguido (HTTP
  429), así que DX Agent respeta ese límite, muestra cuándo se puede volver a
  consultar y, después de un bloqueo, espera al menos 15 minutos antes de reintentar.
- **PSKReporter en vivo:** en Configuración → Fuentes de spots, **PSKReporter** puede
  ser **En vivo (MQTT)** en lugar de **Cuando lo pedís**. DX Agent se conecta entonces
  a mqtt.pskreporter.info, que reenvía cada reporte que llega a PSKReporter en el
  momento, sin cuenta y sin límite de consultas, y sigue:
  - tus propios indicativos, con **TE ESCUCHAN** activado: cada receptor que te
    reporta es un spot de tu indicativo (TE ESCUCHAN), con su distancia según su locator;
  - la estación abierta en la pestaña Estación, desde que la abrís y hasta 15
    minutos después de la última vez que la miraste;
  - las alertas digitales (FT8, FT4…) de la lista que se spotearon en los últimos 15
    minutos;
  - con **Avisar solo si se escucha cerca tuyo** marcado, las estaciones digitales
    que no avisaron por eso: apenas un receptor cercano la reporta en esa banda,
    avisa en el momento, con el spot que se había retenido.

  Sigue como máximo 100 estaciones, por indicativo: nunca un país entero (solo los
  receptores de EE. UU. mandan unos 300 reportes por segundo). Sus receptores cuentan
  para "cerca tuyo" solos, sin botón. **Quién lo escucha** los muestra como PSK, y la
  pestaña Estación dice desde cuándo se sigue la estación y cuántos receptores la
  reportaron. Solo llegan los reportes nuevos: apenas abrís una estación la lista está
  vacía, y los receptores aparecen a medida que sus programas los envían, normalmente
  en unos minutos. Una píldora **PSKReporter** junto a las fuentes muestra la conexión
  y los reportes recibidos. El modo en vivo necesita tu grid locator.

Cuántos receptores hay cerca tuyo depende de dónde estés: los skimmers de la RBN
abundan en América del Norte y Europa y escasean en otras zonas, mientras que
PSKReporter suele tener muchos más receptores de FT8.

### El camino: ¿tu señal llega allá?

"Cerca tuyo" dice si la estación se escucha en tu zona; el **camino** dice si tu propia señal llega
a la zona de ella, con lo medido en los últimos 15 minutos en esa banda:

- **ida, tu señal llega:** un receptor a menos de tu distancia de "cerca tuyo" de la estación (su
  locator, si no el centro de su país) reportó alguno de tus indicativos: un skimmer de la RBN, un
  spotter del cluster o un receptor de PSKReporter (con PSKReporter en vivo, tus indicativos se
  siguen);
- **vuelta, llega hasta acá:** tu WSJT-X decodificó a la estación, o a una estación con locator a
  menos de esa distancia de ella; si no, un receptor cerca tuyo la escuchó ("cerca tuyo"). Un
  decode del período en que el dial de WSJT-X cambió de banda no se toma: ese audio es de la banda
  anterior.

La columna **Cerca tuyo** lo muestra antes de la distancia: **⇄** (verde) en los dos sentidos, **→**
(verde) tu señal llega, **←** (ámbar) llega hasta acá pero tu señal todavía no se reportó allá, un
**·** tenue nada medido todavía; al pasar el mouse dice quién y cuándo. La pestaña Estación lo dice en palabras en la banda de la fila
en que hiciste clic (si no, la del último spot de la estación): "Camino 20 m: Tu señal llega ·
HA8RX te escuchó a 120 km de ella, hace 4 min (-15 dB, PSKReporter)", o que todavía no hay señales.
Es una medición, no una predicción: cuanto más transmitís (unos cuantos CQ en FT8), más zonas
conoce; sin nada medido no dice nada, lo que no quiere decir que la banda esté cerrada.

### La predicción: VOACAP

El camino dice lo medido; **VOACAP** dice qué esperar: la ionosfera mediana del mes para el número
de manchas solares, a esa hora, entre vos y la estación. DX Agent trae VOACAP adentro (una versión
en Python de DVOACAP de VE3NEA, licencia MIT, que da los mismos resultados que VOACAP; no hay nada
que instalar), y el número de manchas solares es el que predice NOAA SWPC para el mes, bajado una
vez por día. Necesita tu grid square.

Lo calcula en los dos sentidos, tu señal allá y la de ellos acá, con cada estación como la tuya
(**Configuración → Propagación**: tu potencia, la ganancia de tu antena sobre la isotrópica, unos
3 dBi un dipolo o una vertical y 8 a 10 una Yagi, y el ruido artificial donde estás: residencial,
rural o silencioso); un QSO necesita los dos, así que cuenta el peor. La chance es la confiabilidad
de VOACAP: cuántas veces en el mes la SNR llega a lo que el modo necesita, en 1 Hz: CW 24 dB y SSB
45 (como la guía de voacap.com), FT8 13 y FT4 17 (sus límites de decodificación, -21 y -17,5 dB en
2.500 Hz), RTTY 34; los otros modos digitales como FT8.

- La columna **VOACAP** de la lista: la chance en la banda y el modo de la fila a esta hora, verde
  desde 50%, ámbar desde 10%, gris por debajo; al pasar el mouse, la SNR en cada sentido, la MUF y
  la configuración. Un clic en el encabezado pone primero las mejores chances. Las estaciones de la
  lista se calculan en segundo plano una vez por hora (cada lugar redondeado a medio grado), así que
  una nueva muestra su cifra a los pocos segundos. VOACAP llega hasta 30 MHz: nada en 6 m y arriba.
  La SNR de VOACAP es en 1 Hz; en FT8 y FT4 el tooltip también la da como la reporta WSJT-X, en
  2.500 Hz, 34 dB menos (27 dB en 1 Hz son unos -7 dB en WSJT-X).
- **Propagación (VOACAP)** en la pestaña Estación: las próximas 24 horas por banda (tus bandas de
  alerta), cada cuadrado más verde cuanto mejor la chance, para CW, SSB, FT8, FT4 o RTTY (al
  principio el modo de la fila); al pasar el mouse por un cuadrado, sus cifras. Arriba, la banda de
  la fila ahora.

Dónde está la estación: el locator que dijo último, si no el centro de su país (lo dice el
tooltip). Es una predicción, la mediana del mes: un día dado la banda puede estar mejor o peor, y
el camino de arriba, cuando hay algo medido, dice lo que pasa ahora.

### Aperturas en VHF: 6 m y 2 m

La Es, la TEP y el tropo abren y cierran en minutos, y VOACAP llega hasta 30 MHz. **Ajustes →
Aperturas en VHF** vigila los reportes en vivo de PSKReporter (MQTT, mqtt.pskreporter.info, en una
conexión propia; necesita tu grid square) y pone una alerta **50 MHz** o **144 MHz** en la lista cuando la banda
abre. Dos formas, cada una se activa por separado:

- **Estaciones cerca tuyo que escuchan lejos**: cuando varias estaciones dentro de la distancia
  **Cerca tuyo** (200 km) escuchan estaciones de un mismo lugar (3 estaciones distintas cerca
  tuyo, que escuchan al menos 2 distintas de ahí: una sola estación fuerte o una baliza que
  escuchan todos no es una apertura), la banda está abierta hacia ahí. La fila es la estación de
  ahí que escuchan más estaciones cerca tuyo, así Sintonizar y la pestaña Estación funcionan como
  en cualquier alerta. Sirve donde hay estaciones activas a tu alrededor.
- **Estaciones que te escuchan**: cuando varias estaciones lejanas de un mismo lugar te reportan
  (3), tu señal llega ahí. Solo mientras transmitís (FT8, FT4, CW...); sirve donde no hay nadie
  más activo cerca.

Un lugar es un país (DXCC), un continente o un campo de grilla (GF, FN...). Solo cuentan
estaciones a esta distancia o más entre sí (6 m 800 km, 2 m 300 km: un vecino por onda de tierra
no es una apertura, y en 2 m el tropo cuenta), y un reporte cuenta durante el tiempo de vida de su
banda (6 m 10 minutos, 2 m 5). Los modos de rebote lunar (JT65, Q65, JT4, QRA64) no cuentan salvo
que lo cambies: por la Luna la banda está "abierta" hacia donde esté arriba.

Qué te falta lo dice ("abierta a Japan: 3 cerca tuyo escuchan 2") y,
debajo, quién escucha a quién. Una apertura avisa una vez (con el sonido activado suena, y sale un
aviso de Windows salvo que lo desactives), y su fila la sigue: más estaciones, y "cerrada" cuando
pasa un tiempo de vida entero sin reportes. La próxima apertura hacia ahí vuelve a avisar. La
píldora **VHF** del encabezado es su conexión, y el filtro 50-144 MHz muestra sus alertas.

Todos los números se pueden cambiar. Menos falsas alarmas, no ninguna: un decode falso de FT8
puede repetirse, y con pocas estaciones cerca tuyo una apertura puede pasar sin verse.

### Indicativos mal decodificados de la RBN

A veces un skimmer de la RBN decodifica mal un indicativo: P9DX, F6A por F6ABW. Uno así lo escucha
solo ese skimmer, mientras que una estación real enseguida la escuchan varios, o aparece en el
cluster. Por eso, con **Alertas de la RBN: esperar a un 2.º skimmer** (Configuración → Alertas,
activado de fábrica, `alerts.rbn_confirm`), una estación que escuchó un solo skimmer de la RBN avisa
cuando la escucha otro skimmer, o un spotter del cluster o un receptor de PSKReporter, en esa banda
dentro de 10 minutos (normalmente uno o dos). Los spots del cluster, que publican personas, avisan
enseguida; el spot de un skimmer que pasa el cluster (spotter `K9LC-#`) es de ese skimmer, y también
espera. El indicativo de una DXpedición activa (de la lista de DXpediciones) avisa enseguida: es
muy improbable que un indicativo mal decodificado sea justo ese, y el tab DXpediciones ya dice
que está en el aire. Desmarcado, avisan enseguida y el indicativo lleva un **?** ámbar hasta que
lo escucha alguien más.

### Alertas repetidas (tiempo de espera)

La misma alerta no se repite dentro del tiempo de espera (15 minutos por defecto):

- **Alertas de país** (ATNO, NEW BAND, NEW MODE, NEW SLOT): se limitan por
  país + banda + modo. Con una estación de EE. UU. en 30 m CW alcanza; durante los
  15 minutos siguientes no llega una alerta por cada otra estación de EE. UU. en
  30 m CW.
- **Alertas de indicativo** (DXPEDITION, WATCHLIST, NEW CALL): se limitan por
  indicativo + banda + modo, así que la DXpedición vuelve a avisar cuando pasa a otra
  banda o modo.
- **GRID NUEVO** se limita por grid + banda: con una estación en FN31 en 6 m alcanza.
- **PREFIJO NUEVO** se limita por prefijo + banda: con una estación HG19 en 20 m alcanza.

Guardar la Configuración no reinicia el tiempo de espera, y cerrar y volver a abrir DX Agent tampoco:
lo que avisó en esos últimos minutos vuelve a la lista cuando llega su spot, pero no muestra otra
notificación ni vuelve a sonar.

---

## 6. El archivo de configuración

Todo lo de la página de configuración se guarda en `config.toml`, en tu carpeta de DX Agent
(ver [Inicio rápido](#1-inicio-rápido); **Configuración** muestra la ruta exacta). También se puede editar a mano; después hay que reiniciar `run`.

| Sección     | Ajuste                      | Por defecto                                       | Qué hace |
|-------------|-----------------------------|---------------------------------------------------|----------|
| (inicio)    | `data_dir`                  | `data` (por defecto)                              | Dónde se guardan las descargas, el historial de alertas y la contraseña de LoTW guardada |
| station     | `callsign`                  | (tu indicativo)                                   | Se usa para conectarse al cluster y a la RBN |
| station     | `log_source`                | `adif`                                            | `adif` = un archivo de tu logger; `lotw` = todos los QSOs que subiste a LoTW (sin archivo ADIF); `new` = un log nuevo que lleva DX Agent, `data/<INDICATIVO>.adi` (para empezar de cero); `logbook` = el logbook de DX Agent, `data/log-<INDICATIVO>.db` (experimental) |
| station     | `adif`                      | `C:/Users/you/AppData/Roaming/Log4OM2/backup/CALL_*_backup.adi` | Ruta o patrón del log. Con un patrón se usa el archivo más nuevo. También acepta una lista de rutas |
| station     | `grid`                      | vacío (= se toma del log)                         | Tu grid locator, para "cerca tuyo" |
| station     | `others`                    | `[]`                                              | Tus otros indicativos, cada uno con su log: `[{call = "N1CALL", adif = ["C:/…/N1CALL.SQLite"]}]` (ver Varios indicativos) |
| station     | `active`                    | vacío (= todos tus indicativos)                   | El indicativo al que siguen las alertas, el DXCC y el WAZ; lo cambia el selector de la cabecera |
| alerts      | `alert_on`                  | `atno, dxpedition, new_band, new_mode, watchlist` | Qué tipos de alerta se activan |
| alerts      | `call_scope`                | `band_mode`                                       | Para DXpediciones y lista de seguimiento: `call` = cualquier QSO cuenta, `band` = por banda, `band_mode` = por banda y modo |
| alerts      | `bands`                     | 160m–6m (sin 60m)                                 | Los spots en otras bandas se ignoran |
| alerts      | `modes`                     | `CW, PHONE, DIGI`                                 | Grupos de modos con alertas |
| alerts      | `watchlist`                 | vacío                                             | Indicativos a buscar siempre; admite comodines, por ejemplo `"VP8*"` |
| alerts      | `ignore`                    | vacío                                             | Indicativos que nunca generan alerta; admite comodines |
| alerts      | `cooldown_minutes`          | `15`                                              | Tiempo mínimo antes de repetir la misma alerta |
| alerts      | `desktop`                   | `true`                                            | Notificaciones de Windows (incluidas en Windows 10/11) |
| alerts      | `notify_max_priority`       | `1`                                               | Notificaciones para: 1 = solo ATNO; 3 = también modo nuevo y lista de seguimiento |
| alerts      | `near_km`                   | `1500`                                            | "Cerca tuyo" = la escuchó una estación a esta distancia en km o menos |
| alerts      | `near_only`                 | `false`                                           | Avisar solo si la estación se escucha cerca tuyo |
| alerts      | `rbn_confirm`               | `true`                                            | Un spot de la RBN avisa cuando la estación la escucha un 2.º skimmer, o un spot del cluster o de PSKReporter (un indicativo mal decodificado no avisa) |
| alerts      | `latest_only`               | `false`                                           | Lista del panel: dejar solo la última fila de cada estación en la misma frecuencia y modo |
| alerts      | `self_spots`                | `true`                                            | Listar los spots de tu propio indicativo (TE ESCUCHAN): quién te escucha y a qué distancia |
| alerts      | `expire_minutes`            | `0`                                               | Lista del panel: quitar las estaciones que no se spotean en esa banda y modo hace estos minutos (0 = nunca) |
| alerts      | `keep_days`                 | `7`                                               | Días de alertas que se guardan en `data/dxagent.db` (0 = ninguna). Con la RBN, unas 25.000 alertas por día, unos 15 MB |
| ui          | `enabled`                   | `true`                                            | Iniciar el panel web con `run` |
| ui          | `port`                      | `8073`                                            | Dirección del panel: `http://localhost:8073` |
| ui          | `open_browser`              | `true`                                            | Abrir el panel automáticamente al iniciar `run` |
| ui          | `check_updates`             | `true`                                            | Avisar en el panel (una pastilla junto a la versión) cuando sale un DX Agent más nuevo: le pregunta a GitHub cada hora cuál es la última versión del repositorio de descargas. No se manda nada tuyo ni se instala nada |
| ui          | `filters`                   | `["continent", "near", "hide_confirmed", "lotw", "activity"]` | Los filtros que se ven sobre la lista de alertas (uno oculto queda apagado); también lo guarda el ⚙ del panel, junto a Limpiar filtros |
| ui          | `hidden_types`              | `[]`                                              | Tipos de alerta cuyo filtro no se ve (siguen alertando), por su nombre en inglés: `ATNO`, `NEW BAND`... `SELF`, `OPEN` (50-144 MHz); también lo guarda el ⚙ del panel, al final de los tipos de alerta |
| logbook     | `reload_seconds`            | `60`                                              | Cada cuánto revisar si cambió el archivo ADIF |
| logbook     | `live`                      | `true`                                            | Leer también, cada 10 segundos, los QSOs que Log4OM 2 guardó desde su último backup, de su base |
| logbook     | `udp_port`                  | `12065`                                           | QSOs que tu programa de log manda por UDP al loguearlos (N1MM, DXLog.net, Log4OM, WSJT-X; ver "Tus QSOs a medida que los logueás"); 0 = apagado |
| logbook     | `udp_group`                 | `""`                                              | Un grupo multicast al que unirse en ese puerto (el UDP Server de WSJT-X, por ejemplo `239.255.0.1`) |
| logbook     | `backup_folder`             | `""`                                              | Dónde van los backups del logbook (una carpeta de OneDrive, Google Drive o Dropbox para tenerlos en la nube); vacío = `data/backups` |
| logbook     | `backup_hours`              | `24`                                              | Un backup del logbook de cada indicativo cada tantas horas; 0 = solo antes de importar |
| logbook     | `backup_keep`               | `10`                                              | Cuántos backups de cada indicativo se guardan (los más viejos se borran) |
| dxpeditions | `refresh_hours`             | `6`                                               | Cada cuánto releer las fuentes de DXpediciones |
| dxpeditions | `sources`                   | `["ng3k", "425dxn", "clublog"]`         | Dónde buscar DXpediciones: NG3K ADXO, 425 DX News, Club Log |
| dxpeditions | `show_have`                 | `true`                                            | Mostrar las líneas DXPED HAVE (gris, sin notificación) |
| lotw        | `enabled`                   | `true`                                            | Descargar tus confirmaciones de LoTW |
| lotw        | `username`                  | vacío (= tu indicativo)                           | Usuario de LoTW (vacío = tu indicativo) |
| lotw        | `password_env`              | `LOTW_PASSWORD`                                   | Nombre de una variable de entorno de la que leer la contraseña (opcional, ver LoTW) |
| lotw        | `refresh_hours`             | `12`                                              | Cada cuánto descargar confirmaciones nuevas |
| cluster     | `enabled`                   | `true`                                            | Usar el DX cluster |
| cluster     | `hosts`                     | `w3lpl.net:7373`, `dxspider.co.uk:7300`, `dx.k3lr.com:23` | Servidores de cluster, en orden. Si uno falla, no envía nada durante 5 minutos o no envía ningún spot durante 10 (una sesión que el servidor dejó de atender), se usa el siguiente. Vale también para la RBN |
| cluster     | `commands`                  | vacío                                             | Comandos enviados al conectar, por ejemplo `["set/ft8"]` |
| cluster     | `history_minutes`           | `30`                                              | Al conectar, pedirle al cluster sus últimos spots (`sh/dx 100`) y quedarse con los de los últimos N minutos; `0` = no |
| cluster     | `spotter_continents`        | vacío (todos)                                     | Usar solo spots de spotters de estos continentes |
| rbn         | `enabled`                   | `true`                                            | Usar la Reverse Beacon Network |
| rbn         | `cw` / `digital`            | `true` / `true`                                   | Fuente CW+RTTY (puerto 7000) y FT8/FT4 (puerto 7001) |
| rbn         | `spotter_continents`        | `SA, NA`                                          | Avisar solo cuando un skimmer de estos continentes escucha la estación |
| rig         | `target`                    | `none`                                            | Botón Sintonizar: `none`, `log4om`, `n1mm`, `dxlog`, `omnirig`, `hamlib`, `flrig` o `dxlab` |
| rig         | `host` / `port`             | `127.0.0.1` / `0`                                 | Dónde escucha ese programa; 0 = su puerto por defecto |
| rig         | `set_mode`                  | `true`                                            | También cambiar el modo (CW, USB/LSB, datos/RTTY) |
| rig         | `omnirig_rig`               | `1`                                               | Radio 1 o 2 de OmniRig |
| marathon    | `enabled`                   | `false`                                           | Seguir el CQ DX Marathon (una pestaña Marathon y alertas MARATHON) |
| marathon    | `event`                     | `year`                                            | `year` (del 1 de enero al 31 de diciembre) o `sprint` |
| marathon    | `sprint_start` / `sprint_end` | `2026-10-17` / `2026-10-26`                     | Primer y último día del Sprint (UTC) |
| marathon    | `category`                  | `all`                                             | Modos que cuentan: `all`, `CW`, `PHONE`, `DIGI` o `classic` (CW y fonía) |
| marathon    | `alert_countries` / `alert_zones` | `true` / `true`                             | Avisar por un país / una zona CQ todavía no trabajados en el Marathon |
| marathon    | `calls`                     | `[]` (= tu indicativo principal)                  | Tus indicativos cuyos QSOs suman, hasta 2 |
| vhf         | `near` / `self`             | `false` / `false`                                 | Aperturas en VHF: las estaciones cerca tuyo que escuchan lejos / las estaciones que te escuchan (ver Aperturas en VHF) |
| vhf         | `bands`                     | `["6m", "2m"]`                                  | Las bandas vigiladas |
| vhf         | `radius_km`                 | `200`                                             | near: a qué distancia de vos una estación está cerca |
| vhf         | `stations` / `senders`      | `3` / `2`                                         | Estaciones distintas que tienen que escucharla / (near) estaciones distintas de ahí que tienen que escuchar |
| vhf         | `group`                     | `dxcc`                                            | Qué es un lugar: `dxcc`, `continent` o `field` |
| vhf         | `min_km_6m` / `min_km_2m`   | `800` / `300`                                     | Solo cuentan estaciones a esta distancia o más entre sí (km) |
| vhf         | `ttl_6m` / `ttl_2m`         | `10` / `5`                                        | Minutos que cuenta un reporte; una apertura se cierra después de tanto tiempo sin ninguno |
| vhf         | `no_eme` / `notify`         | `true` / `true`                                   | Dejar afuera los modos de rebote lunar / un aviso de Windows cuando abre la banda |

La contraseña de LoTW nunca se guarda en este archivo (ver más abajo).

### Consejos de ajuste

- **Demasiadas alertas.** En las bandas donde tu log tiene pocos países, NEW BAND
  aparece seguido. Dejar marcadas solo **ATNO**
  y **DXpedición**, o desmarcar las bandas que no se operan.
- **Solo estaciones que probablemente se escuchen.** En **Solo skimmers en**, elegir
  solo tu continente. Es una mejor señal de que hay propagación hacia vos, pero donde
  hay pocos skimmers se van a perder algunos spots.
- **Ocultar DXpediciones que ya se tienen.** Desmarcar **Mostrarlas igual**.
- **Buscar estaciones puntuales.** Agregarlas a la **Lista de seguimiento**, por ejemplo `3Y0K` o
  `VP8*`.
- **Repetir alertas antes o después.** Cambiar **No repetir durante**.

### Varios indicativos

Agregá tus otros indicativos (uno de concurso, por ejemplo) en Configuración → Estación →
**Tus otros indicativos**, cada uno con su log: un archivo ADIF (`*` toma el más nuevo), o
directamente la base de datos de Log4OM (`.SQLite`, por ejemplo
`C:/Users/vos/Log4OM/N1CALL.SQLite`: no hace falta exportar nada). Entonces:

- **Las alertas, el DXCC y el WAZ suman todos tus indicativos juntos**: un país trabajado con
  cualquiera está trabajado, un QSO confirmado con cualquiera está confirmado. El indicativo
  de la cabecera pasa a ser un selector: **Todos** (lo predeterminado) o un indicativo solo,
  para ver qué le falta a ese. El cambio se aplica enseguida y se guarda para la próxima vez.
- **El CQ DX Marathon** suma los indicativos que marques en su tarjeta, hasta 2: las reglas
  admiten dos en una participación, operados desde la misma ubicación.
- **De quién es cada QSO:** los QSOs de cada log son de su indicativo. Un QSO cuyo
  `STATION_CALLSIGN` es otro de tus indicativos va a ese (también sirve un programa de log
  con todos tus indicativos en un solo log). Los QSOs que llegan por UDP o de la base de
  Log4OM van al indicativo que dicen (WSJT-X, N1MM y Log4OM lo dicen) o, si no, a tu
  indicativo principal.
- **LoTW:** alcanza con una cuenta de LoTW con los certificados de todos tus indicativos: las
  confirmaciones se descargan con el indicativo con el que se hizo cada QSO, y cada uno toma
  las suyas. Un archivo de confirmaciones de antes de esta versión se vuelve a descargar una
  vez, en segundo plano (mientras tanto se usa el anterior).
- Tus propios spots, de cualquiera de tus indicativos, nunca avisan. El cluster y la RBN se
  conectan con tu indicativo principal; **¿Estás en su log?** le pregunta a Club Log por
  todos tus indicativos (con Todos) o por el elegido.

### Un log nuevo (para empezar de cero)

Si todavía no tenés log, elegí Configuración → Estación → **Tu log** → **Empezar de cero (log
nuevo)**. DX Agent crea un log ADIF vacío, `data/<INDICATIVO>.adi` (un indicativo con `/` lleva
`_`), y lo usa: al principio toda estación cuenta como nueva. Nunca pisa uno que ya exista.

Los QSOs que tus programas mandan por UDP al loguearlos (WSJT-X, N1MM Logger+, DXLog.net,
Log4OM...: ver "Tus QSOs a medida que los logueás") se escriben en él, una sola vez cada uno,
así el log crece solo. Nada más escribe en él, y DX Agent nunca escribe en el archivo de tu
programa de log. Es un archivo ADIF común: cuando empieces a usar un programa de log,
importalo ahí y elegí **Archivo ADIF**.

### El logbook de DX Agent (experimental)

DX Agent puede llevar tu log él mismo: Configuración → Estación → **Tu log** → **Logbook de DX
Agent (experimental)** (`log_source = "logbook"`). Sus opciones quedan entonces en su propia
pestaña, Configuración → **Log**, que solo aparece con el logbook (como el tab Log y la vista Log). Cada uno de tus indicativos tiene su propio
logbook, `data/log-<INDICATIVO>.db` (SQLite), con todos los campos de cada QSO, incluidos los
`APP_*` y los tuyos: no se pierde nada de lo que escribió un logger. Los logbooks de cada
indicativo nunca se mezclan (cada uno va a subir como su indicativo); las alertas, el DXCC y
el WAZ los siguen sumando juntos, como con varios logs. **Tus otros indicativos** entonces no
necesitan archivo: cada uno tiene su logbook.

- **Importá** el ADIF de tu logger una vez (Configuración → Log → **Importar ADIF…**, o **Importar QSOs…** en la vista Log, que importa en el indicativo que muestra el log o, con Todos, el que elijas en su menú; eligiendo el
  indicativo si tenés más de uno): el archivo solo se lee, un QSO que ya está se saltea, y entra
  todo o nada (una transacción). Solo entran los QSOs de ese indicativo: uno hecho como otro
  indicativo (`STATION_CALLSIGN`) queda afuera y se cuenta, con un aviso para importar el
  archivo en el logbook de ese indicativo. Un log de 50.000 QSOs tarda de 15 a 30 segundos.
- **Los QSOs nuevos** llegan por UDP como antes (WSJT-X, N1MM, Log4OM...), cada uno al logbook
  del indicativo que dice, y desde el **tab Log**: su formulario se llena solo cuando elegís
  una estación en la lista o en el mapa (el indicativo, su grid, el parque o la cumbre), con la
  frecuencia y el modo de la radio a medida que se mueve (leídos por OmniRig o TCI: `rig.target =
  "omnirig"` o `"tci"`; por TCI, el slice que mueve Sintonizar, o el del split; sin eso, los
  del spot). En split, el QSO se guarda con la frecuencia en que transmitiste (`FREQ`) y la
  que recibiste (`FREQ_RX`). Escribir la frecuencia o el modo deja de seguir la radio
  hasta la próxima estación. La fecha y la hora siguen al reloj (en azul) hasta que las
  escribas, así el QSO queda con la hora en que lo guardás; **Ahora** las vuelve a poner en hora.
  Un indicativo escrito a mano: cuando dejás de escribir aparece su estación (callbook,
  cuadro de trabajadas, QSOs anteriores) y se va lo que DX Agent había llenado para la anterior (nombre, QTH, grid,
  referencias); lo que escribiste vos queda. **Esc** en el indicativo lo borra, y con él lo que
  DX Agent había llenado para esa estación. **Guardar QSO**, ahí o en el tab Estación,
  lo guarda, y dice qué te suma ("te suma: banda nueva"), según tu log antes de ese QSO. Cada QSO lleva lo que agrega un logger: DXCC, país, zonas CQ e ITU, continente
  (cty.csv), tu grid y tu indicativo.
- **La vista Log**, al lado de Lista y Mapa: tu log, lo más nuevo primero, de a 100, con
  búsqueda por indicativo (con Todos, el de cada indicativo); ahí no aparecen los filtros de las
  alertas, sino los del log, arriba de la lista: banda (las que hay en tu log), modo (CW, Fonía,
  Digitales, FT8, FT4, RTTY), el país (una parte de su nombre como lo escribe el log, o un prefijo: `LU`, `VP8`, `3Y`, `LU5`, por el DXCC del QSO según cty.csv), fechas desde y hasta, LoTW (confirmados, la
  última bajada, subidos sin confirmar, sin subir), Club Log (subidos, a subir de nuevo,
  rechazados, sin subir) y QSL papel (recibida, enviada sin recibir, ninguna: `QSL_RCVD` y
  `QSL_SENT`, salvo que su `_VIA` diga `E`, electrónica). Son botones como los de la lista, agrupados con su nombre (BANDA, MODO, PAÍS, FECHA, LOTW, CLUB LOG, QSL PAPEL): un clic elige una opción, otro clic en la misma la saca; cada una dice cuántos QSOs mostraría con la búsqueda y los otros filtros como están (con 20m elegido, los modos dicen cuántos en 20m). Tu log se tiene en memoria y se pone al día solo con lo que cambió, así que filtrar y ordenar no lo vuelven a leer entero. Se combinan con la búsqueda y el orden; el que está puesto se resalta,
  **Limpiar filtros** los saca, y no se guardan al recargar. La flecha al lado de **Lista** /
  **Mapa** / **Log** pliega la búsqueda y los filtros del log en la línea de la flecha, que dice
  lo puesto ("FILTROS QSL papel: recibida"); el contador, Limpiar filtros, Importar QSOs… y las subidas quedan.
  Se pliega aparte de los filtros de la lista y el navegador lo recuerda. Un clic en el encabezado de una columna ordena todo el log por ella (otra vez: al
  revés; una tercera: lo más nuevo primero); los QSOs sin valor ahí van al final, y el orden se
  recuerda. Cada subida o bajada se ve en un recuadro arriba del log mientras corre (en qué paso
  está, una barra que se mueve, cuánto lleva), después en verde o rojo con cómo terminó hasta que
  lo cerrás, y las columnas LoTW y CL del log muestran lo que marcó. **✎** edita un QSO en el formulario del tab Log (**Guardar cambios**; **Cancelar** lo
  deja como estaba): solo cambia lo que muestra el formulario, todos los demás campos quedan, y
  lo que era queda guardado en el logbook (tabla `edited`). Cambiar el indicativo, la hora, la
  banda o el modo de un QSO ya subido lo marca para subirlo otra vez (Club Log y QRZ.com: `M`;
  LoTW: `N`, LoTW lo toma como un QSO nuevo y el viejo queda ahí). **✕** borra un QSO cuando
  confirmás: queda guardado aparte en el logbook (tabla `deleted`), y no se borra de LoTW,
  QRZ.com ni Club Log.
- Los botones de subir y bajar, arriba de la vista Log, aparecen solo para lo que está configurado: **Subir a LoTW** con TQSL instalado, **Bajar de LoTW** con el usuario y la contraseña de LoTW, **Subir a Club Log** con tu email y la contraseña de aplicación de Club Log, **Subir a QRZ** y **Bajar de QRZ** con la clave de la API del logbook de QRZ.com. Si la página no puede leer su estado (el log ocupado con una importación), lo vuelve a pedir a los pocos segundos.
- **Subir a LoTW**, arriba de la vista Log, con cuántos QSOs todavía no están ahí
  (`LOTW_QSL_SENT` no es `Y`): DX Agent los escribe en un archivo y corre **TQSL** con él
  (`tqsl -q -d -u -a compliant -l <ubicación>`), que los firma con tu certificado y los sube;
  los que TQSL ya había subido se saltean. Cuando TQSL dice que LoTW los tiene, quedan marcados
  `LOTW_QSL_SENT = Y` con la fecha. Hace falta TQSL instalado, con tu certificado y una ubicación
  de estación (Station Location) por indicativo: Configuración → Log → **Ubicación de estación**
  (automática: la única que TQSL tiene para ese indicativo; con dos o más, elegila). La frase de
  tu certificado la guarda TQSL; DX Agent nunca la ve.
- **Bajar de LoTW:** tus confirmaciones nuevas de LoTW en ese momento (lo que LoTW recibió desde
  la última descarga), cada una marcada en su QSO (`LOTW_QSL_RCVD = Y`, `LOTW_QSLRDATE`): el QSO
  con el mismo indicativo, minuto y banda en el logbook del indicativo con que se hizo. Debajo
  de cómo terminó, **Confirmaron:** las estaciones (indicativo, banda y modo; las primeras 40, y
  cuántas más), y **Verlos en el log** deja en la vista Log todos los QSOs que confirmó (el
  filtro LoTW → última bajada; cada logbook los recuerda, así que sigue después de reiniciar, y
  una bajada sin nada nuevo no lo cambia). Necesita LoTW activado, con su contraseña
  (Configuración → LoTW).
- **Subir a Club Log**, con cuántos QSOs todavía no están ahí (`CLUBLOG_QSO_UPLOAD_STATUS` no es
  `Y`): los QSOs de cada indicativo al log de ese indicativo en tu cuenta de Club Log, con tu
  email de Club Log y una **contraseña de aplicación** (Club Log → Settings → App Passwords; no
  es tu contraseña de Club Log), en Configuración → Log; la contraseña se guarda cifrada en
  `data/clublog.secret`. Un QSO va con realtime.php de Club Log, varios en un solo putlogs.php.
  Club Log le dio a DX Agent su clave de API con condiciones que DX Agent cumple: solo cuando
  apretás el botón, un pedido a la vez y como mucho uno por minuto (un segundo indicativo espera
  su minuto); un QSO que Club Log rechaza queda marcado como rechazado (**✗** en la columna CL,
  con el motivo) y no se manda de nuevo hasta que lo edites; un login que Club Log rechaza frena
  todas las subidas hasta que cambies el email o la contraseña; con la clave no se consulta ni se
  baja nada. La clave nunca está en el código: los paquetes la llevan compilada; si lo corrés
  desde el código, poné tu propia clave de aplicación en `data/clublog-app.key`. Club Log no
  tiene confirmaciones para bajar.
- **Subir a QRZ** y **Bajar de QRZ**, con cuántos QSOs todavía no están en tu logbook de QRZ
  (`QRZCOM_QSO_UPLOAD_STATUS` no es `Y`). QRZ usa una **API key por logbook** (QRZ → Logbook →
  API key, con la forma `ABCD-0A0B-1C1D-2E2F`; los guiones se pueden omitir), no tu usuario ni tu
  contraseña: la ponés en Configuración → Log, una por indicativo, y se guarda cifrada en
  `data/qrzlog-<INDICATIVO>.secret` (nunca en `config.toml` ni en el código, y se manda sólo a
  logbook.qrz.com). **Subir a QRZ** manda los QSOs que faltan de a uno (INSERT, un segundo entre
  cada uno: la primera subida de un log grande tarda), y cada uno queda con
  `QRZCOM_QSO_UPLOAD_STATUS = Y`, la fecha y el `logid` de QRZ (`APP_QRZLOG_LOGID`); uno que QRZ
  rechaza (una fecha fuera del rango del logbook, por ejemplo) queda marcado con el motivo y no
  se manda de nuevo hasta que lo edites. **Bajar de QRZ** trae lo que cambió en QRZ desde la
  última bajada, en páginas de 250, y marca cada QSO (`QRZCOM_QSO_DOWNLOAD_STATUS`, la fecha y el
  `logid`, y `QSL_RCVD` en los que QRZ tiene confirmados). Las dos necesitan que la cuenta de ese
  indicativo tenga una **suscripción de QRZ activa** (XML Logbook Data o superior): sin ella la
  API contesta que la key no está autorizada y DX Agent frena ese indicativo (el botón dice por
  qué) hasta que cambies la key. **Probar**, en Configuración → Log, hace un solo pedido
  (`STATUS`, que no cambia nada) y dice si la key sirve.
- Las subidas y la bajada corren en segundo plano, cada una en su recuadro arriba del log.
  Antes de subir, DX Agent dice cuántos QSOs de cada indicativo van a ir.
- **Una estación clickeada en la vista Log** se abre en el tab Log, no en el tab Estación (el
  formulario queda como está): debajo del formulario, el QSO clickeado con un botón **Editar
  este QSO**, lo que dicen tus callbooks de la estación, las bandas y modos en que la trabajaste
  y confirmaste (el cuadro del tab Estación, con su detalle en cada celda) y tus QSOs con ella.
  La estación del formulario se muestra ahí de la misma forma, sin el nombre, QTH y grid que ya
  están en el formulario: solo de qué callbook vinieron (y QSL via, LoTW y eQSL si los dice).
- **Callbooks** (Configuración → Log): el nombre, QTH y grid de una estación desde **QRZ.com**,
  **HamQTH** o **QRZCQ**, cada uno con tu propia cuenta; los usuarios van en `config.toml`
  (`[callbook]`), las contraseñas cifradas en `data/qrz.secret`, `data/hamqth.secret` y
  `data/qrzcq.secret`. Los datos completos de QRZ.com necesitan su suscripción XML Logbook Data
  (sin ella, algunos campos: DX Agent dice "datos limitados"); la API de QRZCQ necesita una
  cuenta Premium; la de HamQTH es gratis. Se consultan en ese orden, o con el de **Consultar
  primero** antes que los otros (HamQTH, por ejemplo, sin suscripción a QRZ.com:
  `first = "hamqth"` en `[callbook]`), y contesta el primero que conoce el indicativo; lo que le falte a su respuesta (QTH o grid de QRZ.com sin suscripción)
  lo completan los siguientes. Se consultan cuando elegís una estación o la clickeás en la vista Log, una vez por
  indicativo mientras DX Agent está abierto (en memoria, nunca en disco). Su nombre, QTH y grid
  llenan los del formulario que estén vacíos (el grid de 4 caracteres de un spot pasa a ser el
  de 6 del callbook cuando coinciden); el recuadro dice de qué callbook vino. Al editar un QSO
  también: solo sus campos vacíos, resaltados y avisados, y se guardan con Guardar cambios. Una sesión se usa
  hasta que el servicio la termina, después se hace un login de nuevo; un login que un callbook
  rechaza no se vuelve a intentar hasta que cambies ese usuario o contraseña.
- **Backups:** el logbook entero como ADIF, comprimido, en
  `data/backups/log-<INDICATIVO>-<fecha>.zip`: una vez por día, antes de cada importación y antes
  de mover QSOs; se guardan los últimos 10. Restaurar uno es importarlo. En Configuración → Log →
  Backups se eligen la **carpeta** (**Buscar…**, o los botones **OneDrive**, **Google Drive**,
  **Dropbox** que aparecen si están en la PC: una carpeta "DX Agent" adentro), **cada cuántas
  horas** (0 = solo antes de importar) y **cuántos guardar** por indicativo. Para tenerlos en la
  nube, una carpeta de OneDrive, Google Drive o Dropbox: su programa sube lo que se guarda ahí
  (DX Agent no se conecta a ningún servicio). Una carpeta nueva recibe un backup en pocos
  minutos; si no se puede escribir (la unidad no está), el backup va a `data/backups`. **Hacer
  backup ahora** hace uno de cada indicativo en la carpeta guardada.
- **Todavía no:** subir a QRZ.com. Mientras sea experimental,
  guardá también una copia de tu log en otro lado.

### Tus QSOs a medida que los logueás

DX Agent lee tu archivo de log (el backup ADIF) al arrancar y cada vez que cambia. Un programa
de log que le avisa cada QSO al guardarlo lo mantiene al día entre medio: una estación recién
trabajada deja de alertar enseguida, las alertas que ya están en la lista dicen lo que
necesitan ahora y se actualizan las DXpediciones, las activaciones y los slots del mapa. Los
QSOs se suman al archivo hasta que el siguiente backup los trae. Los que llegan por UDP además
se guardan en `data/dxagent.db`: si cerrás DX Agent antes de que tu programa de log escriba su
archivo, no se pierden. En el próximo arranque vuelven a contar, y cada uno se borra cuando el
log releído ya lo tiene (como máximo 2.000, durante 30 días).

**Log4OM 2** no necesita nada: DX Agent lee los QSOs posteriores al backup directo de la base
de Log4OM, cada 10 segundos (`logbook.live`).

**Por UDP** (`logbook.udp_port`, 12065 de fábrica, en 127.0.0.1; se cambia en Configuración →
**Puerto UDP de los QSOs logueados**, con el grupo multicast al lado): un mismo puerto recibe el XML
de contactos de N1MM, texto ADIF y los mensajes de WSJT-X. No es el puerto del panel (8073) ni el
de la radio. En el programa de log se agrega
`127.0.0.1` puerto `12065` como destino, junto a los que ya tengas:

| Programa | Dónde | Probado |
|----------|-------|---------|
| **N1MM Logger+** | Config → Configure Ports… → **Broadcast Data**: marcar **Contacts** y agregar `127.0.0.1:12065` a las direcciones | su formato documentado |
| **DXLog.net** | Options → Configure network: QSO broadcast `127.0.0.1:12065` (hasta tres, separadas por espacios); Options → Broadcast: QSO, y **Use N1MM QSO format** | su formato (el de N1MM) |
| **Log4OM 2** (sin la base) | Settings → Software integration → Connections → UDP outbound, tipo **ADIF_MESSAGE**, `127.0.0.1` puerto `12065` | formato ADIF |
| **WSJT-X / JTDX** | Para sus QSOs, en general no hace falta: tu programa de log los recibe y se los avisa a DX Agent. Sí para lo que decodifican (ver "Lo que decodifica tu WSJT-X"), o si loguean solos: Settings → Reporting → UDP Server. Un grupo multicast (`239.255.0.1`, puerto `2237`) deja que DX Agent (`udp_group = "239.255.0.1"`, `udp_port = 2237`) y un programa que se une a grupos (GridTracker, JTAlert) lo escuchen a la vez; una dirección común llega a un solo programa | sus dos mensajes de QSO registrado (Logged ADIF y QSO Logged) |
| **HRD Logbook** | Tools → Configure → QSO Forwarding → **UDP Send**: `127.0.0.1`, puerto `12065` | sin probar: HRD no dice su formato; funciona si manda ADIF o el XML de N1MM |

Sin UDP (DXKeeper, Logger32, N3FJP, otros): un programa que escribe un archivo ADIF a medida
que logueás, o lo exporta solo, se puede agregar como segundo archivo de log en la
configuración, junto al backup; el `wsjtx_log.adi` de WSJT-X es uno. UDP no confirma la
entrega: un paquete perdido solo espera al siguiente backup.

### Lo que decodifica tu WSJT-X

Si WSJT-X (o JTDX) le manda sus mensajes a DX Agent, cada estación que decodifica es un spot
más, como uno del cluster o de la RBN: avisa aunque nadie la haya spoteado, si es lo que
buscás (país nuevo, banda nueva, lista de seguimiento...). Cuenta como escuchada **a 0 km de
vos**, en el grid que dice WSJT-X: para "cerca tuyo", su filtro y **Avisar solo si se escucha
cerca tuyo**, una estación que tu radio decodifica siempre está cerca. Los decodificados
dudosos (los que WSJT-X marca con `?`), los de un archivo `.wav` y los que WSJT-X vuelve a
mandar (Replay) no cuentan. La frecuencia es la del dial más el desplazamiento de audio.

Llega por el mismo puerto que los QSOs (`logbook.udp_port`). WSJT-X manda a un solo servidor
UDP, y si ya lo usa otro programa (Log4OM, JTAlert, GridTracker):

- **un grupo multicast**: en WSJT-X, Settings → Reporting → UDP Server `239.255.0.1`, puerto
  `2237`; en DX Agent, `udp_group = "239.255.0.1"` y `udp_port = 2237`. Lo escuchan a la vez
  DX Agent y los programas que se unen a grupos (GridTracker, JTAlert);
- o **el programa que ya lo recibe lo reenvía** a `127.0.0.1:12065` (JTAlert y GridTracker
  pueden reenviar los mensajes de WSJT-X).

Una píldora **WSJT-X** junto a las fuentes muestra los decodificados recibidos, y en la lista
la fila dice quién la escuchó: tu indicativo, el SNR y el mensaje (WSJT-X).

La estación que llamás en WSJT-X (con doble clic en su decodificado, o escrita en DX Call) se
abre en la pestaña Estación, como un clic en ella en la lista: qué tenés de su país, el camino,
VOACAP... Una vez cada vez que cambia DX Call, así podés mirar otra estación mientras tanto.

---

## 7. Integración con LoTW

LoTW se usa de dos maneras.

### Quién sube a LoTW (público, sin usuario)

ARRL publica la fecha de la última subida de unos 236.000 indicativos. DX Agent
descarga esa lista una vez por día y agrega el estado de la estación a cada alerta:

| Se muestra        | Significado |
|-------------------|-------------|
| `LoTW 2026-09-22` | La estación sube a LoTW; esa es su última subida |
| `LoTW announced`  | Todavía no subió nada, pero el listado de la DXpedición dice QSL vía LoTW. Los indicativos nuevos de DXpediciones suelen subir recién después del viaje |
| `no LoTW`         | No usa LoTW ni anunció LoTW: la confirmación va a requerir QSL en papel u OQRS |

### LoTW como log (sin archivo ADIF)

Si no tenés un archivo ADIF (o tu logger no lo exporta), DX Agent puede usar LoTW como
tu log: Configuración → Estación → **Tu log** → **Solo LoTW (sin archivo ADIF)**,
después completar usuario y contraseña en la sección LoTW y hacer clic en **Guardar y
aplicar**.

- Baja todos los QSOs que subiste a LoTW, confirmados o no, a `data/lotw_log.adi`. La
  primera vez le pide a LoTW un año por vez (un solo pedido con un log grande puede
  tener a LoTW ocupado tanto tiempo que se corta la conexión), con una barra de progreso
  en el panel. Si LoTW está ocupado o no responde, reintenta solo cada 10 minutos y
  sigue desde el último año completo. Después solo pide los QSOs subidos desde la última
  descarga, cada vez que revisa LoTW (cada 12 horas por defecto).
- La descarga de confirmaciones funciona igual, en segundo plano: mientras tanto el
  agente ya empieza a vigilar los spots.
- Las confirmaciones salen de esa misma descarga más la descarga normal de
  confirmaciones.
- Tu grid locator para "cerca tuyo" se toma de los QSOs (MY_GRIDSQUARE), salvo que lo
  pongas en Configuración.
- **Límite:** solo cuenta lo que subiste a LoTW. Un QSO que anotaste pero nunca subiste
  aparece como "no trabajado".

### Tus confirmaciones (requiere tu contraseña de LoTW)

DX Agent descarga tus QSL confirmadas de LoTW cada 12 horas y las suma al índice del
log. Así "confirmado" se mantiene al día aunque Log4OM no se haya sincronizado con
LoTW. La primera descarga trae todo y puede tardar unos minutos; las siguientes solo
traen las QSL recibidas desde la última descarga.

**Para activarlo:** Configuración → LoTW → marcar **Descargar mis confirmaciones de
LoTW**, escribir la contraseña del sitio de LoTW, hacer clic en **Probar ingreso** y
luego en **Guardar y aplicar**.

Dónde queda la contraseña:

- Se cifra con la protección propia de Windows para tu cuenta de usuario (DPAPI) y se
  guarda en `data/lotw.secret`. Solo tu cuenta de Windows en esta PC puede
  descifrarla. Nunca se escribe en `config.toml`, así que ese archivo se puede
  compartir sin problema.
- Como alternativa, se puede definir una variable de entorno una vez en PowerShell y
  abrir una terminal nueva: `setx LOTW_PASSWORD "tu-contraseña-de-lotw"`. Si existen
  las dos, gana la variable de entorno, y la página de configuración lo indica.

Qué pasa sin contraseña o con una incorrecta:

- Sin contraseña, DX Agent usa las confirmaciones que ya están en tu archivo ADIF y
  al iniciar muestra `no LoTW password set`.
- Con una contraseña incorrecta, **Probar ingreso** dice
  `LoTW rechazó este usuario o contraseña`; mientras funciona muestra
  `LoTW did not return ADIF - check username / password` y usa el log ADIF de la
  misma manera.

### Qué cuenta como confirmado

Un QSO está confirmado cuando `LOTW_QSL_RCVD` o `QSL_RCVD` vale `Y` o `V` en el log, o
cuando viene de la descarga de LoTW. eQSL no cuenta, igual que en las reglas del DXCC.

---

## 8. Cómo funciona

```text
 DX cluster (telnet, w3lpl.net:7373) ─────┐
 RBN CW     (telnet.reversebeacon.net:7000)┼──> lee la línea "DX de ..."
 RBN FT8/FT4 (telnet.reversebeacon.net:7001)┘          │
                                                       v
                          banda + modo (RBN, comentario o plan de bandas)
                                                       │
                                                       v
                    filtros: balizas, indicativo propio, bandas, modos,
                             ignorados, continente del spotter
                                                       │
                                                       v
                         indicativo ──> país DXCC (cty.csv)
                                                       │
                                                       v
   log ADIF + QSL de LoTW ──> índice trabajado / confirmado ──> comparar ──> motivos
   NG3K/425/Club Log ─────> DXpediciones activas ──────────┘        │
                                                                    v
                                           filtrar por alert_on y tiempo de espera
                                                                    │
                                                                    v
                 panel web + línea en la terminal + notificación + data/dxagent.db
```

### Paso a paso

1. **Fuentes.** Tres conexiones telnet funcionan a la vez: el DX cluster, RBN CW y
   RBN FT8/FT4. Cada una responde al pedido de ingreso con tu indicativo (o lo envía
   a los 10 s si no reconoce el pedido). Si una conexión se corta, o un servidor no
   envía nada durante 5 minutos, pasa al siguiente servidor de la lista; cuando todos
   fallaron, espera cada vez más entre intentos, hasta 5 minutos.
   **Spots recientes:** apenas entra al cluster, el agente envía `sh/dx 100` (DXSpider
   y AR-Cluster responden con sus últimos ~100 spots, más o menos la última media hora)
   y procesa los de los últimos `history_minutes`, del más viejo al más nuevo, para que
   la lista no arranque vacía. Generan alertas con su hora real, nunca muestran
   notificación ni suenan, y un spot ya visto no se repite después de una reconexión.
   La RBN no responde a `sh/dx`, así que arranca vacía.
2. **Lectura.** Cada línea `DX de SPOTTER: FREC INDICATIVO comentario HORA` se
   convierte en un spot. Los sufijos de skimmer como `-#` se quitan del indicativo
   del spotter.
3. **Banda y modo.** La banda sale de la frecuencia. El modo sale de la RBN (informa
   CW, RTTY, FT8, FT4), si no del comentario del cluster (`cw`, `ssb`, `ft8`...), si
   no de lo que la RBN informó para ese indicativo a menos de 2 kHz en los últimos 30
   minutos, y si no de la frecuencia: las frecuencias de FT8/FT4 (14074, 10136...) son
   FT8/FT4, y las partes de CW y de fonía del plan de bandas son CW y SSB. Solo un spot
   en una parte que usan varios modos (la digital, la fonía de 160 y 6 m) se muestra
   con `?`. Los modos se agrupan como en el DXCC:
   **CW**, **PHONE** (SSB, AM, FM) y **DIGI** (FT8, FT4, RTTY, PSK, MFSK...).
4. **Filtros.** Se descartan las balizas, tu propio indicativo, las bandas y modos
   que no se quieren, los indicativos de la lista de ignorados y (si está
   configurado) los spotters fuera de los continentes elegidos.
5. **País.** El indicativo se asocia a una entidad DXCC con el `cty.csv` de AD1C:
   primero indicativos exactos, después el prefijo más largo que coincida. Los
   indicativos portables como `TF/PD9DX` o `W9HT/VP9` usan el prefijo de la
   ubicación; `/P`, `/M` y `/QRP` se ignoran; `/MM` y `/AM` no tienen país.
6. **Tu log.** El archivo ADIF se carga en conjuntos de lo que ya tenés: países,
   país+banda, país+modo, país+banda+modo e indicativos, cada uno como "trabajado" y
   como "confirmado". Para los QSOs del log se usa el campo `DXCC` del ADIF cuando
   existe. El archivo se revisa cada 60 segundos y se vuelve a leer cuando cambia
   (unos 3 segundos para 49.000 QSOs). Las confirmaciones de LoTW se suman igual.
7. **Comparación.** El spot se compara con esos conjuntos para encontrar los motivos
   (ATNO, banda nueva, modo nuevo, combinación nueva, DXpedición, lista de
   seguimiento, indicativo nuevo). Para las DXpediciones también calcula qué sumaría
   trabajarlas, incluidas las confirmaciones.
8. **Alerta.** Se descartan los motivos que no están en `alert_on`, se aplica el
   tiempo de espera y la alerta se muestra en el panel, se imprime y se guarda.

Al guardar la configuración, el agente detiene las fuentes, vuelve a cargar la
configuración, el log y LoTW, y reinicia las fuentes. El panel y las alertas que ya
están en pantalla se mantienen.

### Fuentes de datos

| Fuente | Para qué se usa | Dirección |
|--------|-----------------|-----------|
| DX cluster (W3LPL, con DXSpider UK y K3LR como alternativas) | Spots de operadores | `w3lpl.net:7373`, `dxspider.co.uk:7300`, `dx.k3lr.com:23` |
| Reverse Beacon Network | Spots de skimmers, CW/RTTY y FT8/FT4 | `telnet.reversebeacon.net:7000` y `:7001` |
| Archivos de países de AD1C | Indicativo → país DXCC | https://www.country-files.com/ |
| Calendario ADXO de NG3K | DXpediciones anunciadas | https://www.ng3k.com/Misc/adxo.html |
| Calendario de 425 DX News | DXpediciones anunciadas | https://www.425dxn.org/index.php?op=wcal |
| Club Log | DXpediciones subiendo su log ahora, sus logs y OQRS, Most Wanted de DXCC | https://clublog.org/expeditions.php |
| Actividad de usuarios de LoTW (ARRL) | Quién sube a LoTW | https://lotw.arrl.org/lotw-user-activity.csv |
| Informe de LoTW (ARRL) | Tus confirmaciones | https://lotw.arrl.org/lotwuser/lotwreport.adi |
| Lista de skimmers de la RBN | Dónde está cada skimmer (grid locator) | https://www.reversebeacon.net/nodes/ |
| PSKReporter | Quién recibió una estación en FT8/FT4 (solo a pedido) | https://pskreporter.info/ |
| PSKReporter en vivo (MQTT) | Los mismos reportes en el momento, para las estaciones seguidas (PSKReporter → En vivo); y para las aperturas en VHF, los receptores a tu alrededor y tus propios indicativos en 6 m y 2 m | https://mqtt.pskreporter.info/ |
| Spots de POTA y WWFF | Quién está activando un parque ahora (cada 2 minutos) | https://api.pota.app/spot/activator, https://spots.wwff.co/static/spots.json |
| Natural Earth (world-atlas) | Costas y fronteras de los países para el mapa | https://www.naturalearthdata.com/ |
| Mapas DXCC de GridTracker | Entidades DXCC, fronteras solo DXCC y zonas CQ para el mapa | https://gitlab.com/gridtracker.org/gridtracker2 |

---

## 9. Archivos del proyecto y datos descargados

El código está en `dxagent/`, un módulo por tarea. `config.toml`, `config.toml.bak` y `data/`
están en tu carpeta de DX Agent, no en la del programa ([Inicio rápido](#1-inicio-rápido)). Todo
lo descargado va a `data/` y se puede borrar en cualquier momento; se vuelve a descargar cuando
hace falta.

| Archivo                     | Función |
|-----------------------------|---------|
| `config.toml`               | Tu configuración (la escribe la página de configuración; es personal y no se comparte) |
| `config.example.toml`       | La configuración inicial para una instalación nueva |
| `start-dx-agent.bat`        | Doble clic para iniciar DX Agent en Windows, sin ventana |
| `start-dx-agent-console.bat` | Lo mismo, en una ventana que muestra todo lo que va informando |
| `start-dx-agent.sh`         | Los mismos dos lanzadores para Linux y macOS (`-console.sh` muestra lo que va informando); usan el Python del paquete si lo trae (`python/`, o en la Mac `python-arm64/` / `python-x86_64/`) |
| `start-dx-agent.command`    | macOS: doble clic en Finder para arrancarlo; saca la carpeta de cuarentena para que el Python que trae pueda correr |
| `tools/make_package.py`     | Arma los paquetes para compartir: el zip de Windows y los tar.gz de Linux y macOS (con Python, programa compilado), y con `--source` el zip con el código; nunca tus datos personales |
| `config.toml.bak`           | La configuración anterior, que se guarda en cada cambio |
| `README.md`                 | Resumen breve (en inglés) |
| `DOCUMENTATION.md`          | Esta guía en inglés |
| `DOCUMENTACION.md`          | Esta guía |
| `dxagent/__main__.py`       | Línea de comandos: `run`, `dxpeditions`, `check`, `stats` |
| `dxagent/agent.py`          | Ciclo principal: inicia las fuentes, filtra spots, recarga el log, actualiza DXpediciones y LoTW, aplica la configuración guardada |
| `dxagent/config.py`         | Lee `config.toml` con valores por defecto; lo valida y lo escribe para la página de configuración |
| `dxagent/home.py`           | Dónde se guardan tu configuración y tus datos (tu carpeta de DX Agent); los copia ahí desde la carpeta de una versión anterior en el primer arranque |
| `dxagent/credentials.py`    | Guarda la contraseña de LoTW cifrada para tu usuario de Windows (en Linux y en la Mac, legible solo por vos) |
| `dxagent/telnet.py`         | Se conecta al cluster y a la RBN, ingresa y reconecta |
| `dxagent/spots.py`          | Convierte las líneas `DX de ...` en indicativo, frecuencia, banda, modo, SNR, WPM |
| `dxagent/bands.py`          | Banda según la frecuencia, grupos de modos, modo según el plan de bandas |
| `dxagent/cty.py`            | Indicativo → país DXCC, con `cty.csv` |
| `dxagent/adif.py`           | Lee archivos ADIF, incluidos nombres con acentos (UTF-8) |
| `dxagent/logbook.py`        | Arma el índice de trabajados y confirmados a partir del log y de LoTW |
| `dxagent/matcher.py`        | Decide los motivos de alerta y qué sumaría una DXpedición |
| `dxagent/dxpeditions.py`    | Lee y une las listas de DXpediciones de NG3K, 425 DX News y Club Log |
| `dxagent/lotw.py`           | Lista de usuarios de LoTW, prueba de ingreso y descarga de confirmaciones |
| `dxagent/alerts.py`         | Línea en la terminal, colores, notificación, tiempo de espera, historial |
| `dxagent/queries.py`        | Grilla de la estación, lista de DXpediciones y avance en el DXCC, compartidas por los comandos y el panel |
| `dxagent/reach.py`          | "Cerca tuyo": quién escuchó cada estación y a qué distancia de vos; lista de skimmers de la RBN; PSKReporter |
| `dxagent/pskmqtt.py`        | PSKReporter en vivo: un cliente MQTT para mqtt.pskreporter.info, y las estaciones seguidas |
| `dxagent/refinfo.py`        | La página de un parque POTA o una cumbre SOTA, para la pestaña Estación |
| `dxagent/geo.py`            | Grid locators y distancias |
| `dxagent/onlinelog.py`      | Busca tus QSOs en el log de una DXpedición en Club Log |
| `dxagent/wsjtx.py`          | Manda un indicativo a WSJT-X (mensaje UDP Configure) |
| `dxagent/activities.py`    | Activaciones (POTA, SOTA, IOTA...) leídas del comentario de los spots |
| `dxagent/hunting.py`       | Cumbres, parques, islas... que trabajaste, banda por banda |
| `dxagent/livelog.py`       | Los QSOs que Log4OM guardó desde su último backup, de su base |
| `dxagent/udplog.py`        | QSOs que otros programas mandan por UDP al loguearlos (XML de N1MM / DXLog.net, ADIF, WSJT-X), y lo que decodifica WSJT-X |
| `dxagent/qsolog.py`        | El logbook de DX Agent (experimental): un archivo SQLite por indicativo, importar, backups |
| `dxagent/qsoentry.py`      | Un QSO cargado en el tab Log como ADIF, la edición de uno, y lo que un logger agrega a un QSO (DXCC, zonas...) |
| `dxagent/tqsl.py`          | Subida a LoTW con TQSL: lo encuentra, sus ubicaciones de estación, firma y sube |
| `dxagent/clublog.py`       | Subida a Club Log (realtime.php, putlogs.php), como mucho un pedido por minuto |
| `dxagent/callbook.py`      | El nombre, QTH y grid de una estación desde QRZ.com, HamQTH o QRZCQ (tus cuentas) |
| `dxagent/store.py`         | `data/dxagent.db` (SQLite): los registros propios de DX Agent |
| `dxagent/worldmap.py`       | Tierra, fronteras DXCC y entidades DXCC para el mapa |
| `dxagent/marathon.py`       | CQ DX Marathon: qué QSOs cuentan, los países y zonas trabajados en el período, qué te sumaría un spot |
| `dxagent/rig.py`            | Sintonizar: se comunica con Log4OM, N1MM, DXLog.net, OmniRig, Hamlib, flrig o DXLab; lee la frecuencia y el modo de la radio por OmniRig |
| `dxagent/tci.py`            | TCI (AetherSDR, ExpertSDR, Thetis): sintoniza la radio y mantiene las alertas en su panadaptador |
| `dxagent/web.py`            | Servidor del panel: página, API JSON, eventos en vivo, configuración |
| `dxagent/static/index.html` | El panel y la página de configuración (HTML, CSS y JavaScript en un solo archivo) |
| `dxagent/static/logo.svg`  | El logo de DX Agent (encabezado del panel e ícono de la pestaña) |
| `tests/test_dxagent.py`     | 117 pruebas automáticas (`python -m unittest tests.test_dxagent`) |
| `tests/test_filters.js`     | Los filtros de la lista de alertas, en todas sus combinaciones (los corren las pruebas de arriba si Node.js está instalado) |

| Archivo de datos                              | Origen               | Se actualiza   |
|-----------------------------------------------|----------------------|----------------|
| `data/cty.csv`                                | country-files.com    | cada día (se revisa cada 6 horas, también con DX Agent abierto) |
| `data/dxped-ng3k.json`, `dxped-425dxn.json`, `dxped-clublog.json` | NG3K, 425 DX News, Club Log | cada 6 horas |
| `data/clublog-mostwanted.json`                | Most Wanted de Club Log | cada día    |
| `data/lotw-user-activity.csv`                 | ARRL LoTW            | cada día       |
| `data/lotw_qsls.adi` + `data/lotw_state.json` | tu cuenta de LoTW    | cada 12 horas  |
| `data/log-<INDICATIVO>.db`, `data/backups/`   | el logbook de DX Agent (experimental) | al loguear; un backup por día |
| `data/lotw.secret`                            | página de configuración | al guardar una contraseña |
| `data/rbn-skimmers.json`                      | lista de skimmers de la RBN | cada día |
| `data/sota-summits.csv`                       | lista de cumbres de SOTA | cada mes  |
| `data/pota-parks.csv`                          | Lista de parques de POTA (pestaña Referencias) | cada mes  |
| `data/world-countries-50m.json`               | Natural Earth (vía world-atlas) | una vez |
| `data/dxcc-shapes.json`, `data/cq-zones.json` | GridTracker                     | una vez |
| `data/world-map.json`                         | armado con los dos de arriba (el mapa terminado) | cuando cambian |
| `data/dxagent.db`                             | DX Agent: alertas (últimos `keep_days` días), dónde estuvo cada activador (últimos 32 días), tus QSOs con ellos, QSOs por UDP que todavía no están en tu log | mientras corre |
| `data/cache/log-<INDICATIVO>.pickle`          | DX Agent: los índices del log de cada indicativo tal como se leyó, para no volver a leer un log grande en cada arranque. Se usa solo si son iguales los archivos del log, el archivo de países, tus indicativos, el año y la versión de DX Agent; los QSOs posteriores (la base de tu logger, UDP) se suman encima como siempre. Se puede borrar sin problema | cuando cambia el log |
| `data/update.json`                            | DX Agent: la última versión en GitHub, consultada cada hora (`ui.check_updates`) | cada hora |
| `data/dx-agent.log`                           | DX Agent (sin ventana) | mientras corre; menos de 5 MB |

### data/dxagent.db

Los registros propios de DX Agent son un único archivo SQLite (Python ya trae SQLite; no hay
que instalar nada). Todo lo que se baja de afuera sigue siendo el archivo tal como vino: se
reemplaza entero y se lee entero. Las tablas:

| Tabla        | Qué                                                   | Se guarda |
|--------------|-------------------------------------------------------|-----------|
| `alerts`     | cada alerta: hora, indicativo, banda y la alerta en JSON | `alerts.keep_days` días (7) |
| `activators` | dónde estuvo cada activador (indicativo, hora, referencias) | 32 días |
| `hunted`     | tus QSOs con activadores vistos en el aire (indicativo, programa, referencia, banda, hora) | para siempre |
| `udp_qsos`   | QSOs que tus programas mandaron por UDP y tu archivo de log todavía no tiene (sus campos ADIF) | hasta que el log los tenga; como máximo 2.000, 30 días |

Cualquier programa de SQLite lo abre (DB Browser for SQLite, `sqlite3`), incluso con DX Agent
corriendo. Las versiones anteriores escribían `alerts.jsonl` (y `activations*.jsonl`):
el primer arranque los lee y los renombra `*.migrated`; se pueden borrar cuando quieras. El
`data` de una alerta, por ejemplo (abreviado):

```json
{"utc": "2026-10-13T14:55:04+00:00", "call": "VP2MAW", "freq_khz": 14030.0, "band": "20m",
 "mode": "CW", "mode_group": "CW", "entity": "Montserrat", "dxcc": 96, "reasons": ["dxpedition"],
 "headline": "DXPED HAVE", "need": [], "need_text": "have it: 20m CW confirmed", "lotw": "no LoTW",
 "source": "rbn", "spotter": "WE9V", "snr": 7, "wpm": 27,
 "dxpedition": {"entity": "Montserrat", "end": "2026-10-20", "qsl": "?", "info": "By DK8YY ..."}}
```

---

## 10. Limitaciones conocidas y solución de problemas

### Limitaciones conocidas

- **Funciones solo de Windows.** Todo lo demás funciona en Linux con el paquete `-linux`, y en la Mac con el `-macos` (notificaciones incluidas, en el Centro de notificaciones). Ahí
  no están: el log en vivo de Log4OM, y los destinos de **Sintonizar** Log4OM / N1MM / DXLog.net /
  OmniRig / DXLab (Hamlib, flrig y TCI sí funcionan); el envío del indicativo a WSJT-X; y el cartel de Windows
  cuando no puede arrancar (ahí el motivo va a `data/dx-agent.log`). En Linux, las notificaciones
  necesitan `plyer` y el botón **Buscar…** de la configuración necesita tkinter (`python3-tk`); la
  Mac usa su propia ventana para elegir archivos. La contraseña de LoTW se cifra con DPAPI de
  Windows; en Linux y en la Mac solo se ofusca, con permisos `0600`.
- **Un QSO que acabás de guardar, con Log4OM 2:** DX Agent lo lee directo de la base de
  Log4OM en unos 10 segundos, sin esperar al siguiente backup ADIF (`logbook.live`, activado
  de fábrica). Encuentra la base en el `l4ong.status` de Log4OM, la abre solo para leer y
  toma solo los QSOs posteriores al más nuevo del backup. Las alertas que ya están en la lista
  pasan a decir lo que necesitan ahora; también se actualizan las DXpediciones, las
  activaciones y los slots del mapa. El backup sigue siendo el log: se lee entero al arrancar y
  cada vez que cambia. No se lee: Log4OM con MySQL, o un log de Log4OM que no es el de la
  configuración (la base tiene que tener el QSO más nuevo del backup). Las confirmaciones que
  Log4OM recibe de QSOs viejos siguen esperando al backup (o a la descarga de LoTW de DX Agent).
- **Una estación recién trabajada sigue generando alertas, con otros programas de log.** Salvo
  que el programa le avise cada QSO a DX Agent (por UDP: N1MM Logger+, DXLog.net, WSJT-X...) o
  escriba su ADIF a medida que logueás, un QSO nuevo cuenta recién cuando está en el archivo de
  log. Ver "Tus QSOs a medida que los logueás".
- **La descarga de LoTW todavía no se probó con una cuenta real.** La lista pública
  de LoTW funciona; la descarga de confirmaciones y **Probar ingreso** siguen el formato
  de informes de ARRL, pero todavía no se probaron con una contraseña real.
- **Modo deducido de la frecuencia en los spots del cluster.** Cuando ni el
  comentario ni la RBN dicen el modo, sale de la frecuencia (pasando el mouse sobre el
  modo se ve). Una estación fuera de los segmentos habituales (SSB en la parte de CW, el
  FT8 de una DXpedición en su propia frecuencia) puede quedar mal; la parte digital se
  muestra con `?`.
- **Las fechas anunciadas son aproximadas.** Una DXpedición da alertas desde un día antes de su
  fecha de inicio. Cuando pasa su fecha de fin anunciada, DX Agent vuelve a leer sus fuentes
  (NG3K, 425 DX News, Club Log) en el momento, antes de sacarla de la lista: si alguna la
  extendió, sigue con la fecha nueva; si siguen diciendo que terminó, sale de la pestaña
  DXpediciones y de las alertas. Mientras las fuentes no se puedan leer, se queda (se reintenta
  cada 30 minutos), como máximo dos días después de su fin. Al empezar un nuevo día UTC se
  vuelve a calcular cuáles están activas.
- **Indicativos KG4.** El archivo de países le da todo el prefijo KG4 a Guantánamo, pero solo los
  KG4 con sufijo de dos letras (KG4AA) están ahí: KG4 + una o tres letras (KG4OJT) es un
  indicativo de Estados Unidos, y DX Agent lo toma así. Las estaciones de Guantánamo que el
  archivo nombra una por una cuentan como Guantánamo.
- **El archivo de países** (el `cty.csv` de AD1C) se baja de nuevo cuando tiene un día, revisándolo
  cada 6 horas con DX Agent abierto; cuando cambió, los spots usan el nuevo y tu log se vuelve a
  indexar con él.
- **Indicativos portables.** Los indicativos como `TF/PD9DX` se asocian al prefijo
  más corto. En casos raros, como `3D2/R` para Rotuma, el país puede salir mal.
- **El modo con Log4OM va por OmniRig.** El control remoto de Log4OM no puede cambiar el modo
  de la radio, así que DX Agent lo cambia por OmniRig (ver Sintonizar la radio): un Log4OM que
  maneja la radio de otra forma (Hamlib, su propio CAT) recibe solo la frecuencia.
- **60 m está desactivada por defecto.** Elegirla en **Bandas** para vigilarla; para
  60 m no hay deducción de modo por plan de bandas.

### Solución de problemas

| Síntoma | Solución |
|---------|----------|
| Franja amarilla "DX Agent no puede iniciar: No se encontró ningún archivo ADIF" | Abrir la configuración, corregir la ruta del log y usar **Probar** hasta que encuentre el archivo; luego guardar |
| No encuentra `config.toml` | Está en tu carpeta de DX Agent ([Inicio rápido](#1-inicio-rápido)); con `-c`, dar la ruta completa |
| La configuración no se guarda, aparece una lista en rojo junto al botón | Corregir cada punto de la lista; no se guarda nada hasta corregirlos todos |
| Un cambio de configuración empeoró las cosas | `config.toml.bak` tiene la configuración anterior: copiarlo sobre `config.toml` y reiniciar |
| "saved password could not be read" | La contraseña la guardó otro usuario de Windows u otra PC; volver a escribirla en la configuración |
| `[cluster] ... dropped ...; trying ...` | Normal: pasa solo al siguiente cluster de la lista |
| Pocas alertas del cluster | Normal: el cluster envía unos pocos spots por minuto contra varios por segundo de la RBN, y la RBN suele reportar primero la misma estación |
| Algunas alertas no muestran notificación | Revisar **Notificaciones de Windows** en la configuración; DXPED HAVE, NEW SLOT y NEW CALL no muestran notificación por defecto |
| Ninguna notificación | Marcar **Mostrar notificaciones** en la configuración y revisar que las notificaciones de Windows estén activadas (Configuración de Windows → Sistema → Notificaciones, incluida "Windows PowerShell", que es quien las muestra) |
| En la terminal aparecen códigos como `[1;93m` | Usar Windows Terminal o la terminal de VS Code |
| `ImportError: bad magic number in 'dxagent'` | Estás corriendo el zip de Windows en Linux: está compilado para su propio Python. Usar el paquete `-linux`, o el zip con el código y tu propio Python |
| `Permission denied` al correr `./start-dx-agent.sh` | `chmod +x start-dx-agent.sh start-dx-agent-console.sh` (con el paquete `-linux` no hace falta) |
| No aparecen notificaciones en Linux | `pip install plyer`; sin él las alertas igual se ven en el panel |
| Mac: "No se puede abrir start-dx-agent.command" / "Apple no pudo verificar…" | No está firmado por Apple: Configuración del Sistema > Privacidad y seguridad > **Abrir igualmente**, o `xattr -dr com.apple.quarantine .` en la carpeta dx-agent (ver Inicio rápido) |
| Datos de países incorrectos o viejos | Borrar `data/cty.csv`; se descarga de nuevo en el próximo inicio |
| `[ui] could not start on port 8073` | Otro programa (u otra copia de DX Agent) usa ese puerto; cerrarlo o cambiar el puerto del panel |
| El panel muestra "Se perdió la conexión con el agente" | `run` se detuvo o falló; iniciarlo de nuevo y la página se reconecta sola |
| El panel aparece vacío después de reiniciar | Se llena con los spots del cluster de los últimos 30 minutos apenas se conecta el cluster (salvo que **Spots recientes al conectar** sea 0). Las alertas anteriores están en `data/dxagent.db` (tabla `alerts`) |
| La lista de DXpediciones parece vieja | Borrar los archivos `data/dxped-*.json` |
| Las confirmaciones de LoTW parecen incorrectas | Borrar `data/lotw_qsls.adi` y `data/lotw_state.json` para forzar una descarga completa |
