import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import {
  TickerTags
} from "@/components/types/global"

import { NUM_POINTS, tickerMaxValues, tickerMaxVolatility, tickerMinValues, tickerRanges, tickerVolatilities } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateRollingAverage =( currentAverage: number, currentQuantity:number,  addedQuantity: number, addedPrice: number ): number => {
  if ( currentQuantity === 0 || currentAverage === 0 ) { return addedPrice; }
  const rawRollingAverage = ( currentAverage * currentQuantity + (addedPrice * addedQuantity)) / ( currentQuantity + addedQuantity );
  return Math.round(rawRollingAverage * 100) / 100;
}

const generateRandomNumber = ( max?: number ): number => {
  if ( max )
      return Math.round( Math.random() * max );

  return Math.round( Math.random() * 200000 );
};

// Sample stock data generator
export const generateStockData = (
  ticker: TickerTags
  , numPoints = NUM_POINTS
) => {

  let price = tickerMinValues[ticker] + Math.round((tickerRanges[ticker] / 2))
  const arr = [];

  for( let i = 0; i < numPoints; i++ ) {
    let newPrice: number = 0;
    
    if( ticker === TickerTags.Trba ) {
      newPrice = Math.round(newPrice - tickerVolatilities[ticker] / 4);
    } else {
      newPrice = Math.round(price + Math.random() * tickerVolatilities[ticker] - tickerVolatilities[ticker] / 2);
    }
    const tickerMax = tickerMaxValues[ticker];
    const tickerMin = tickerMinValues[ticker];

    while( newPrice < tickerMin || newPrice > tickerMax) {
      if( ticker === TickerTags.Trba ) {
        if( newPrice <= 0 ) { newPrice = 0; }
      } else {
        newPrice = Math.round(newPrice + Math.random() * tickerVolatilities[ticker] - tickerVolatilities[ticker] / 2);
      }
    }

    arr[i] = { time: i, price: newPrice };
    price = newPrice;
  }

  return arr;
}

export const changeVolatility = () => {
  for( const key of Object.keys( tickerVolatilities )) {
    const ticker = key as TickerTags;
    tickerVolatilities[ticker] = generateRandomNumber( tickerMaxVolatility[ticker] );
  }
}