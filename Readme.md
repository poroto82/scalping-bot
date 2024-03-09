# Scalping Bot con Telegraf

Este es un bot de scalping desarrollado en Node.js utilizando Telegraf. El bot está diseñado para realizar operaciones de scalping en un mercado específico.

## Configuración del Bot de Telegram

1. Abre Telegram y busca a **BotFather** en la barra de búsqueda.

2. Inicia una conversación con BotFather y sigue las instrucciones para crear un nuevo bot. Puedes hacerlo utilizando el comando `/newbot`.

3. BotFather te pedirá que elijas un nombre para tu bot. Esto será lo que los usuarios verán cuando interactúen con él.

4. Después de elegir un nombre, BotFather te pedirá que elijas un nombre de usuario para tu bot. Debe terminar en "bot" y ser único.

5. Una vez que hayas completado el proceso, BotFather te proporcionará un token de acceso. Copia este token.


## Instalación

1. Clona este repositorio en tu máquina local:

```bash
git clone https://github.com/poroto82/scalping-bot.git


cd scalping-bot

cp .env.example .env

npm install
```

## Uso
Ejecución con Node.js 18
Si tienes Node.js 18 instalado en tu sistema, puedes ejecutar el bot con el siguiente comando:

```bash
node bot.js
```

Ejecución con Docker
Si prefieres ejecutar el bot utilizando Docker, asegúrate de tener Docker instalado en tu sistema y ejecuta el siguiente comando:

```bash
docker run -it -v$(pwd):/app node:18 sh -c 'cd /app && yarn install && node bot.js'
```

## run

- Iniciar charla con tu bot, el mismo cuenta con comandos

/init para iniciar el monitoreo de cripto y guardar el canal de telegram de respuesta

/status muestra el estado de monitoreo actual

/price muestra el precio actual del par seleccionado

/analyse hace un calculo de tendencia

/buy    realiza compra de par

/sell   realiza venta de par

/stop  frena el monitoreo
