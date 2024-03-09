import { config } from 'dotenv';
import { calculations } from "./calculate.js";
import { Telegraf } from 'telegraf'
import { getPairPrice, trade } from './bingXProvider.js';

config();

let
    ema9_1minuto,
    ema200_1minuto,
    volumenOsc_1minuto,
    lastCandleVolume_1minuto,
    ema9_3minutos,
    ema200_3minutos,
    volumenOsc_3minuto,
    lastCandleVolume_3minuto
        = 0;

let intervalId = 0;
let eventoRunning = false;
let chatId = 0

const bot = new Telegraf(process.env.BOT_TOKEN);

function analyseSignals() {
    let tendencia = 0
    let statusEma = []
    let statusEmaVolume = []

    if (ema9_1minuto > ema200_1minuto && ema9_3minutos > ema200_3minutos && lastCandleVolume_1minuto > volumenOsc_1minuto && lastCandleVolume_3minuto > volumenOsc_3minuto) {
        console.log('Tendencia alcista \u{2705}')
        statusEma.push(['Tendencia alcista \u{2705}']);
        tendencia = 1
    }
    else if ((ema9_1minuto < ema200_1minuto || ema9_3minutos < ema200_3minutos)) {
        console.log('Tendencia bajista \u{1F6AB}')
        statusEma = ['Tendencia bajista \u{1F6AB}'];
        tendencia = -1
    }
    else {
        statusEma = 'Sin tendencia clara';
    }

    if (lastCandleVolume_1minuto > volumenOsc_1minuto) {
        statusEmaVolume.push('<b>[Klines 1 min]</b> El volumen actual es <b>mayor</b> que la EMA del volumen. Puede indicar un <b>aumento</b> en la actividad del mercado. \u{2705}');
    } else if (lastCandleVolume_1minuto < volumenOsc_1minuto) {
        statusEmaVolume.push('<b>[Klines 1 min]</b> El volumen actual es <b>menor</b> que la EMA del volumen. Puede indicar una <b>disminución</b> en la actividad del mercado. \u{1F6AB}');
    } else {
        statusEmaVolume.push('<b>[Klines 1 min]</b> El volumen actual es igual a la EMA del volumen. No hay una clara señal de aumento o disminución en la actividad del mercado.');
    }

    if (lastCandleVolume_3minuto > volumenOsc_3minuto) {
        statusEmaVolume.push('<b>[Klines 3 min]</b> El volumen actual es <b>mayor</b> que la EMA del volumen. Puede indicar un <b>aumento</b> en la actividad del mercado. \u{2705}');
    } else if (lastCandleVolume_3minuto < volumenOsc_3minuto) {
        statusEmaVolume.push('<b>[Klines 3 min]</b> El volumen actual es <b>menor</b> que la EMA del volumen. Puede indicar una <b>disminución</b> en la actividad del mercado.  \u{1F6AB}');
    } else {
        statusEmaVolume.push('<b>[Klines 3 min]</b> El volumen actual es igual a la EMA del volumen. No hay una clara señal de aumento o disminución en la actividad del mercado.');
    }

    return {
        tendencia,
        statusEma,
        statusEmaVolume
    }
}

async function processSignals() {
    const result = await calculations();
    if (result){
        ema9_1minuto = result.ema9_1minuto;
        ema200_1minuto = result.ema200_1minuto;
        volumenOsc_1minuto = result.volumenOsc_1minuto;
        lastCandleVolume_1minuto = result.lastCandleVolume_1minuto;
        ema9_3minutos = result.ema9_3minutos;
        ema200_3minutos = result.ema200_3minutos;
        volumenOsc_3minuto = result.volumenOsc_3minuto;
        lastCandleVolume_3minuto = result.lastCandleVolume_3minuto;

        console.log(`---------${process.env.PAR}--------------`);
        console.log('ema9_1minuto ', ema9_1minuto);
        console.log('ema200_1minuto ', ema200_1minuto);
        console.log('volumen Oscilante 1min', volumenOsc_1minuto)
        console.log('--------')
        console.log('ema9_3minuto ', ema9_3minutos);
        console.log('ema200_3minuto ', ema200_3minutos);
        console.log('volumen Oscilante 3min', volumenOsc_3minuto)
        console.log('-----------------------------------------')

        const analysis = analyseSignals()

        if (analysis.tendencia > 0 && !eventoRunning) {
            getPairPrice(process.env.PAR).then(rta=>{
                let text = analysis.statusEma
                text.push('PRECIO ACTUAL: '+rta.price)
                bot.telegram.sendMessage(chatId, text.join('\n'))
            })
            
            eventoRunning = true
        }
        else if (analysis.tendencia < 0 && eventoRunning) {
            bot.telegram.sendMessage(chatId, analysis.statusEma.join('\n'))
            eventoRunning = false
        }
    }
}

bot.command("init", (ctx) => {
    chatId = ctx.message.chat.id
    ctx.reply('Comenzando monitoreo '+process.env.PAR)
    processSignals()
    intervalId = setInterval(processSignals, 30000);
})

bot.command("stop", (ctx) => {
    ctx.reply('Parando monitoreo')
    clearInterval(intervalId)
})

bot.command("price",  (ctx) => {
    getPairPrice(process.env.PAR).then(rta=>{
        ctx.reply(`${process.env.PAR} ${rta.price}`)
    })
})

bot.command("status", (ctx) => {
    let status = `-----------------------------------------
        ema9_1minuto <b>${ema9_1minuto}</b> 
        ema200_1minuto <b>${ema200_1minuto}</b>
        volumen Oscilante 1min <b>${volumenOsc_1minuto}</b>
        -----------------
        ema9_3minuto <b>${ema9_3minutos}</b>
        ema200_3minuto <b>${ema200_3minutos}</b>
        volumen Oscilante 3min <b>${volumenOsc_3minuto}</b>
        -----------------------------------------
        `
    ctx.reply(status, { parse_mode: 'HTML' })
})

bot.command("analyse", (ctx) => {
    const analysis = analyseSignals()
    const msg = `Tendencia: <b>${analysis.statusEma.join('\n')}</b>\n Analisis Volumen: \n ${analysis.statusEmaVolume.join('\n')}
    `
    ctx.reply(msg, { parse_mode: 'HTML' })
})

bot.command("buy", (ctx) => {
    trade(process.env.PAR,'BUY',1).then(rta=>{
        ctx.reply('Orden de compra Generada id: <b>'+rta.orderId+'</b>', { parse_mode: 'HTML' })
    })  
})

bot.command("sell", (ctx) => {
    trade(process.env.PAR,'SELL',1).then(rta=>{
        ctx.reply('Orden de venta Generada id: <b>'+rta.orderId+'</b>', { parse_mode: 'HTML' })
    })
})

bot.command("test",(ctx)=>{
    bot.telegram.sendMessage(chatId, 'test', {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [{ text: "Comprar", callback_data: "btn-buy" }, { text: "Vender", callback_data: "btn-sell" }],

            ]
        }
    })
})

bot.launch()

