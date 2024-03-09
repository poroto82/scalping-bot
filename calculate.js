import { fetchKlines } from "./bingXProvider.js";

export async function calculations() {
    try {
        const klines1Min = await fetchKlines('1m');
        const klines3Min = await fetchKlines('3m');

        console.log(klines3Min)

        if (klines1Min && klines3Min){

            const ema9_1minuto = calculateEMA(klines1Min, 9);
            const ema200_1minuto = calculateEMA(klines1Min, 200);
            //longitud es 1 * 6
            const volumenOsc_1minuto = calculateVolumeEMA(klines1Min.reverse(), 6)
            const lastCandleVolume_1minuto = parseFloat(klines1Min[klines1Min.length - 1].volume);

            const ema9_3minutos = calculateEMA(klines3Min.reverse(), 9);
            const ema200_3minutos = calculateEMA(klines3Min, 200);

            //longitud es 3 * 6
            const volumenOsc_3minuto = calculateVolumeEMA(klines3Min, 18)
            const lastCandleVolume_3minuto = parseFloat(klines3Min[klines3Min.length - 1].volume);

            return {
                ema9_1minuto,
                ema200_1minuto,
                volumenOsc_1minuto,
                lastCandleVolume_1minuto,
                ema9_3minutos,
                ema200_3minutos,
                volumenOsc_3minuto,
                lastCandleVolume_3minuto
            }
        }
        return false

    } catch (error) {
        console.error('Error al procesar los datos:', error);
    }
}

function calculateVolumeEMA(data, period) {
    const alpha = 2 / (period + 1); // Suavizado alpha
    let ema = parseFloat(data[0].volume); // EMA inicial es igual al primer volumen

    for (let i = 1; i < data.length; i++) {
        const volume = parseFloat(data[i].volume);
        ema = alpha * volume + (1 - alpha) * ema;
    }
    return ema;
}

function calculateEMA(data, period) {

    const alpha = 2 / (period + 1); // suavizado alpha
    let ema = parseFloat(data[0].close); // EMA inicial es igual al primer precio de cierre

    for (let i = 1; i < data.length; i++) {
        const closePrice = parseFloat(data[i].close);
        ema = alpha * closePrice + (1 - alpha) * ema;
    }

    return ema;
}
