import {
    StockTickerBalances
  , StockAveragePurchasePrice
  , TickerMaxValues
  , TickerMinValues
  , TickerRange
  , TickerVolatilities
  , StockTickerValues
} from "@/components/types/global"
import { TickerTags } from "@/components/types/global";

export const stockTickers: TickerTags[] = Object.values( TickerTags );
export const stockTickerValues: StockTickerValues = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0}
export const stockTickerBalances: StockTickerBalances = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0};
export const stockAveragePurchasePrice: StockAveragePurchasePrice = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0};

const generateRandomNumber = ( max?: number ): number => {
    if ( max )
        return Math.round( Math.random() * max );
  
    return Math.round( Math.random() * 200000 );
  };

export const tickerMaxValues: TickerMaxValues = {
  'AAPL': 50 + generateRandomNumber(250)
  , 'GOOGL': 50 + generateRandomNumber(400)
  , 'MSFT': 50 + generateRandomNumber(300)
  , 'AMZN': 50 + generateRandomNumber(350)
  , 'FB': 50 + generateRandomNumber(150)
  , 'TSLA': 50 + generateRandomNumber(100)
  , 'NVDA': 50 + generateRandomNumber(500)
  , 'NFLX': 50 + generateRandomNumber(300)
  , 'VRY': 50 + generateRandomNumber(300)
  , 'TRBA': 50 + generateRandomNumber(100)
};
export const tickerMinValues: TickerMinValues = {
  'AAPL': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['AAPL'])
  , 'GOOGL': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['GOOGL'])
  , 'MSFT': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['MSFT'])
  , 'AMZN': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['AMZN'])
  , 'FB': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['FB'])
  , 'TSLA': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['TSLA'])
  , 'NVDA': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['NVDA'])
  , 'NFLX': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['NFLX'])
  , 'VRY': Math.round( (generateRandomNumber(50) / 100) * tickerMaxValues['VRY'])
  , 'TRBA': 0
};
export const tickerRanges: TickerRange = {
  'AAPL': ( tickerMaxValues['AAPL'] - tickerMinValues['AAPL'] )
  , 'GOOGL': ( tickerMaxValues['GOOGL'] - tickerMinValues['GOOGL'] )
  , 'MSFT': ( tickerMaxValues['MSFT'] - tickerMinValues['MSFT'] )
  , 'AMZN': ( tickerMaxValues['AMZN'] - tickerMinValues['AMZN'] )
  , 'FB': ( tickerMaxValues['FB'] - tickerMinValues['FB'] )
  , 'TSLA': ( tickerMaxValues['TSLA'] - tickerMinValues['TSLA'] )
  , 'NVDA': ( tickerMaxValues['NVDA'] - tickerMinValues['NVDA'] )
  , 'NFLX': ( tickerMaxValues['NFLX'] - tickerMinValues['NFLX'] )
  , 'VRY': ( tickerMaxValues['VRY'] - tickerMinValues['VRY'] )
  , 'TRBA': ( tickerMaxValues['TRBA'] - tickerMinValues['TRBA'] )
};
export const tickerMaxVolatility: TickerMinValues = {
  'AAPL': Math.ceil( tickerRanges['AAPL'] / 100 ) * 25
  , 'GOOGL': Math.ceil( tickerRanges['GOOGL'] / 100 ) * 25
  , 'MSFT': Math.ceil( tickerRanges['MSFT'] / 100 ) * 25
  , 'AMZN': Math.ceil( tickerRanges['AMZN'] / 100 ) * 25
  , 'FB': Math.ceil( tickerRanges['FB'] / 100 ) * 25
  , 'TSLA': Math.ceil( tickerRanges['TSLA'] / 100 ) * 25
  , 'NVDA': Math.ceil( tickerRanges['NVDA'] / 100 ) * 25
  , 'NFLX': Math.ceil( tickerRanges['NFLX'] / 100 ) * 25
  , 'VRY': Math.ceil( tickerRanges['VRY'] / 100 ) * 25
  , 'TRBA': Math.ceil( tickerRanges['TRBA'] / 100 ) * 25
};
export const tickerVolatilities: TickerVolatilities = {
  'AAPL': generateRandomNumber(tickerMaxVolatility['AAPL'])
  , 'GOOGL': generateRandomNumber(tickerMaxVolatility['GOOGL'])
  , 'MSFT': generateRandomNumber(tickerMaxVolatility['MSFT'])
  , 'AMZN': generateRandomNumber(tickerMaxVolatility['AMZN'])
  , 'FB': generateRandomNumber(tickerMaxVolatility['FB'])
  , 'TSLA': generateRandomNumber(tickerMaxVolatility['TSLA'])
  , 'NVDA': generateRandomNumber(tickerMaxVolatility['NVDA'])
  , 'NFLX': generateRandomNumber(tickerMaxVolatility['NFLX'])
  , 'VRY': generateRandomNumber(tickerMaxVolatility['VRY'])
  , 'TRBA': generateRandomNumber(tickerMaxVolatility['TRBA'])
};

export const NUM_POINTS = 200;
export const MARKET_REFESH_SPEED = 1000;
export const EDITOR_REFESH_SPEED = 1000;
export const GAME_TIME_LIMIT = 5 * 60 * 1000;