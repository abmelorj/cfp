'use strict';
const logerr = require('../config/logerr');

// ==============================================================
// Rotinas de apoio
// ==============================================================

exports.returnErr = function (err, res) {
    if (!err.status)
        if (!err.message)
            return res.status(500).send(logerr(err))
        else
            return res.status(500).send(logerr(err.message + (err.sql ? '[' + err.sql + ']' : '')))
    else
        return res.status(err.status).send(logerr(err.message));
}

exports.debug = (...msg) => {
    if ((process.env.DEBUG || 'false') == 'true')
        return console.log(...msg);
}

exports.today = () => {
    const now = Date.now();
    return now - (now % 1000);
}

exports.yearMonth = (strDate) => {
    // Pega string date no formado AAAA-MM-DD e retorna o número AAAAMM
    return parseInt(strDate.substring(0, 4) + strDate.substring(5, 7))
}

exports.currency = (strValue) => {
    // Recebe: string value (recebido no JSON)
    // Retorna: string com formato de moeda do Brasil
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
        .format(Number.parseFloat(strValue))
}

exports.dateToString = (date) => {
    // Recebe: date
    // Retorna: string no formato de data no Brasil
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(date)
}

exports.strBrlDateToString = (strBrlDate) => {
    // Recebe: date
    // Retorna: string no formato de data no Brasil
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(Date.parse(strBrlDate) + 1000 * 60 * 60 * 3)
}

/***************************************************************
 * Converte data UTC-3 (America/Sao_Paulo) no formato AAAA-MM-DD em Date UTC
 * @param {strBrlDate}: data UTC-3 (America/Sao_Paulo) no formato AAAA-MM-DD
 * @returns Date Object (UTC TimeZone)
 * ************************************************************/
exports.strBrlDateToDate = (strBrlDate) => {
    // Recebe: date
    // Retorna: string no formato de data no Brasil
    return new Date(Date.parse(strBrlDate) + 1000 * 60 * 60 * 3);
}

/***************************************************************
 * Returns the date with added `months` of delay.
 * @param {Date} date - the initial date
 * @param {Number} months - the delay in months
 * @returns {Date}
 * @author Adapted from https://futurestud.io/tutorials/add-month-s-to-a-date-in-javascript-or-node-js
 **************************************************************/
exports.dateWithMonthsDelay = function (date, months) {
    return date.setMonth(date.getMonth() + months)
}

/**************************************************************
 * @param {yearMonth} number - Ano e mês no formato AAAAMM
 * @returns {date} - Primeiro dia do mês
 **************************************************************/
exports.firstDayYearMonth = (yearMonth) => {
    let strYearMonth = new String(yearMonth)
    let strBrlDate = strYearMonth.substring(0, 4) + '-' + strYearMonth.substring(4, 6) + '-01'
    return this.strBrlDateToDate(strBrlDate);
}

/**************************************************************
 * @param {yearMonth} number - Ano e mês no formato AAAAMM
 * @returns {date} - Primeiro dia do mês seguinte
 **************************************************************/
exports.firstDayNextYearMonth = (yearMonth) => {
    let firstDay = this.firstDayYearMonth(yearMonth)
    return firstDay.setMonth(firstDay.getMonth() + 1);
}

/**************************************************************
 * @param {yearMonth} number - Ano e mês no formato AAAAMM
 * @returns {boolean} Indica se o dado é válido
 **************************************************************/
exports.isYearMonthValid = (yearMonth) => {
    if (isNaN(yearMonth)) return false;
    try {
        // Verifica se o mês informado é válido
        let month = parseInt(yearMonth.substring(yearMonth.length - 2, yearMonth.length))
        console.log(' ========= Month: ', month);
        if (isNaN(month) || month < 1 || month > 12)
            return false;
        // Verifica se o ano informado é válido, acima de 1900
        let year = parseInt(yearMonth.substring(yearMonth.length - 6, yearMonth.length - 2))
        console.log(' ========= Year : ', year);
        if (isNaN(year) || year < 1900)
            return false;
    } catch (err) {
        return false;
    }
    return true;
}