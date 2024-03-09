import CryptoJS from "crypto-js";

const apiUrl = 'https://open-api.bingx.com';


export async function getPairPrice(pair) {
    const endpoint = '/openApi/swap/v2/quote/price';
    const queryParams = { symbol: pair };
    return await fetchData(endpoint, queryParams);
}

export async function trade(pair, side, quantity, apiKey) {
    const endpoint = '/openApi/spot/v1/trade/order';
    const timestamp = new Date().getTime();
    const payload = {
        symbol: pair,
        type: "MARKET",
        positionSide: 'LONG',
        side: side,
        quantity: quantity,
    };

    const sign = generateSignature(payload, timestamp);
    const queryParams = { ...payload, timestamp, signature: sign };

    return await fetchData(endpoint, queryParams, 'POST', apiKey, payload);
}

export async function fetchKlines(interval) {
    const endpoint = '/openApi/spot/v2/market/kline';
    const queryParams = {
        symbol: process.env.PAR,
        interval: interval,
        limit: process.env.KLINE_LIMIT,
    };

    return await fetchData(endpoint, queryParams);
}


export async function getOrder(orderId){
    const endpoint = '/openApi/spot/v1/trade/query';
    const timestamp = new Date().getTime();
    const payload = {
        symbol: process.env.PAR,
        orderId: orderId
    };

    console.log(payload)

    const sign = generateSignature(payload, timestamp);
    const queryParams = { ...payload, timestamp, signature: sign };

    return await fetchData(endpoint, queryParams, 'GET', process.env.APIKEY_BINGX, null);
}

export async function getAllOrders(orderId){
    const endpoint = '/openApi/spot/v1/trade/allOrders';
    const timestamp = new Date().getTime();
    const payload = {
        //symbol: process.env.PAR,
        limit: 500,
        //orderId: orderId
    };

    console.log(payload)

    const sign = generateSignature(payload, timestamp);
    const queryParams = { ...payload, timestamp, signature: sign };

    return await fetchData(endpoint, queryParams, 'GET', process.env.APIKEY_BINGX, null);
}


export async function getHistoricalTrades(){
    const endpoint = '/openApi/swap/v1/market/historicalTrades';
    const timestamp = new Date().getTime();
    const payload = {
        symbol: process.env.PAR,
        //limit: 500
    };

    console.log(payload)

    const sign = generateSignature(payload, timestamp);
    const queryParams = { ...payload, timestamp, signature: sign };

    return await fetchData(endpoint, queryParams, 'GET', process.env.APIKEY_BINGX, null);
}

function buildUrl(endpoint, queryParams) {
    const queryString = new URLSearchParams(queryParams);
    return `${apiUrl}${endpoint}?${queryString}`;
}

function buildHeaders(apiKey) {
    return {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json',
    };
}

async function fetchData(endpoint, queryParams, method = 'GET', apiKey = null, payload = null) {
    const url = buildUrl(endpoint, queryParams);
    const headers = apiKey ? buildHeaders(apiKey) : { 'Content-Type': 'application/json' };

    const requestOptions = {
        method: method,
        headers: headers,
        body: payload ? JSON.stringify(payload) : null,
    };

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code) {
            console.error(data);
            return data.msg;
        }


        return data.data;
    } catch (error) {
        console.error(`Error during ${method} request to ${url}:`, error);
        return error.msg;
    }
}

function generateSignature(payload, timestamp) {
    const parameters = Object.keys(payload)
        .map(key => `${key}=${encodeURIComponent(payload[key])}`)
        .join("&");

    return CryptoJS.enc.Hex.stringify(
        CryptoJS.HmacSHA256(parameters + `&timestamp=${timestamp}`, process.env.APISECRET_BINGX)
    );
}
