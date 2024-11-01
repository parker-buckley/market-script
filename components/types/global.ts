export enum TickerTags {
    Aapl = 'AAPL'
    , Googl = 'GOOGL'
    , Msft = 'MSFT'
    , Amzn = 'AMZN'
    , Fb = 'FB'
    , Tsla = 'TSLA'
    , Nvda = 'NVDA'
    , Nflx = 'NFLX'
    , Vry = 'VRY'
    , Trba = 'TRBA'
}

export type StockTickerValues = Record<TickerTags, number>;
export type StockTickerBalances = Record<TickerTags, number>;
export type StockAveragePurchasePrice = Record<TickerTags, number>;
export type TickerMaxValues = Record<TickerTags, number>;
export type TickerMinValues = Record<TickerTags, number>;
export type TickerRange = Record<TickerTags, number>;
export type TickerMaxVolatility = Record<TickerTags, number>;
export type TickerVolatilities = Record<TickerTags, number>;
export type StockData = Record<TickerTags, { time: number, price: number }[]>;