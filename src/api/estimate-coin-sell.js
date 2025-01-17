import {convertFromPip, convertToPip} from 'minterjs-util';
import {API_TYPE_GATE, API_TYPE_NODE} from '../variables';
import {getData} from './utils';

/**
 * @typedef {Object} EstimateSellResult
 * @property {number|string} will_get - amount of coinToBuy
 * @property {number|string} commission - amount of coinToSell to pay fee
 */

/**
 * @param {MinterApiInstance} apiInstance
 * @return {function(*): (Promise<EstimateSellResult>)}
 * @constructor
 */
export default function EstimateCoinSell(apiInstance) {
    /**
     * Get nonce for new transaction: last transaction number + 1
     * @param {Object} params
     *
     * @param {string} [params.coinToSell]
     * @param {string|number} [params.valueToSell]
     * @param {string} [params.coinToBuy]
     *
     * @param {string} [params.coin_to_sell]
     * @param {string|number} [params.value_to_sell]
     * @param {string} [params.coin_to_buy]
     *
     * @return {Promise<EstimateSellResult>}
     */
    return function estimateCoinSell(params) {
        if (!params.coinToSell && !params.coin_to_sell) {
            return Promise.reject(new Error('Coin to sell not specified'));
        }
        if (!params.valueToSell && !params.value_to_sell) {
            return Promise.reject(new Error('Value to sell not specified'));
        }
        if (!params.coinToBuy && !params.coin_to_buy) {
            return Promise.reject(new Error('Coin to buy not specified'));
        }

        const url = apiInstance.defaults.apiType === API_TYPE_GATE
            ? '/api/v1/estimate/coin-sell'
            : '/estimate_coin_sell';

        params = apiInstance.defaults.apiType === API_TYPE_GATE ? {
            coinToSell: params.coinToSell || params.coin_to_sell,
            valueToSell: convertToPip(params.valueToSell || params.value_to_sell),
            coinToBuy: params.coinToBuy || params.coin_to_buy,
        } : {
            coin_to_sell: params.coinToSell || params.coin_to_sell,
            value_to_sell: convertToPip(params.valueToSell || params.value_to_sell),
            coin_to_buy: params.coinToBuy || params.coin_to_buy,
        };

        return apiInstance.get(url, {params})
            .then((response) => {
                const resData = getData(response, apiInstance.defaults.apiType);
                // receive pips from node and convert them
                return {
                    will_get: convertFromPip(resData.will_get),
                    commission: convertFromPip(resData.commission),
                };
            });
    };
}
