
/*  Utilize the MarketScript library to interact with the market:
    getCurrentValue( tickerName: string ): number
    getHistoricalValue( tickerName: string, lookBackQuantity: number): Record<number,number>[]
    buyStock( tickerName: string, quantity: number ): boolean
    sellStock( tickerName: string, quantity: number ): boolean
    getAveragePurchasePrice( tickerName: string ): number
    getStockBalance( tickerName: string ): number
    getWalletBalance(): number
*/

// Buying the minimum stock and waiting for return value
function minimumStock() {
const transactionQuantity = 1;
    let minValue = 10000;
    for( const ticker of tickers ) {
        if( getCurrentValue(ticker) < minValue ) {
            minTicker = ticker;
            minValue = getCurrentValue(ticker);
        }
    }
    
    if( getWalletBalance() > getCurrentValue(minTicker) ) {
        buyStock( minTicker, transactionQuantity );
    }
    
    for( const ticker of tickers ) {
        if( 
            getAveragePurchasePrice(ticker) > 0
            && getAveragePurchasePrice(ticker) < getCurrentValue(ticker) 
        ) {
            sellStock(ticker, transactionQuantity );
        }
    }

    if( getRemainingTime() === 1 ) {
        for( const ticker of tickers ) {
            sellStock( ticker, getStockBalance(ticker));
        }
    }
}

// get the historical average low of each stock and buy if it's within a certain % of minimum
// sell if within a margin return of purchase price
function percentageBased() { 
    const tickerAllTimeLow = {};
    const tickerAllTimeHigh = {};
    const percentDistanceFromAllTimeLow = {};
    let countWithinTenPercent = 0;
    
    // preprocessing data
    for( const ticker of tickers ) {
            const historicalData = getHistoricalValue(ticker);
            
            let absoluteMin = 10000;
            let absoluteMax = 0;
            for( const datum of historicalData ) {
                if( datum.price < absoluteMin ) {
                    absoluteMin = datum.price;
                }
                if( datum.price > absoluteMax ) {
                    absoluteMax = datum.price
                }
            }
            
            tickerAllTimeLow[ticker] = absoluteMin;
            tickerAllTimeHigh[ticker] = absoluteMax;
            const percentDistance =
                (getCurrentValue(ticker)  - tickerAllTimeLow[ticker])
                / (tickerAllTimeHigh[ticker] - tickerAllTimeLow[ticker]);

            percentDistanceFromAllTimeLow[ticker] = percentDistance;

            if( percentDistance < 0.10 ) { countWithinTenPercent++; }
    }
    
    // is the current value at least a 10% return?
    // sell it all!
    for( const ticker of tickers ) {
        const averagePurchasePrice = getAveragePurchasePrice(ticker);
        if( averagePurchasePrice <= 0 ) continue;
        const currentReturnPercentage = (getCurrentValue(ticker) - averagePurchasePrice) / averagePurchasePrice;
        if( 
            getAveragePurchasePrice(ticker) > 0
            && ( currentReturnPercentage ) > 0.10
        ) {
            sellStock(ticker, getStockBalance(ticker) );
        }
    }

    const walletBalance = getWalletBalance();

    // get the percentage distance from the all time low
    const allocatedFunds = Math.floor(walletBalance / tickers.length);
    for( const ticker of tickers ) {
        if( percentDistanceFromAllTimeLow[ticker] < 0.10 ) {

            const purchaseQuantity = Math.floor(allocatedFunds / getCurrentValue(ticker));

            if( purchaseQuantity > 0 ) {
                buyStock( ticker, purchaseQuantity );
            }
        }
    }

    if( getRemainingTime() === 1 ) {
        for( const ticker of tickers ) {
            sellStock( ticker, getStockBalance(ticker));
        }
    }
}

// similar to % return, but aim to buy within 10% of min and sell within 10% of max
function moonShot() { 
    const tickerAllTimeLow = {};
    const tickerAllTimeHigh = {};
    const percentDistanceFromAllTimeLow = {};
    let countWithinTenPercent = 0;
    
    // preprocessing data
    for( const ticker of tickers ) {
            const historicalData = getHistoricalValue(ticker);
            
            let absoluteMin = 10000;
            let absoluteMax = 0;
            for( const datum of historicalData ) {
                if( datum.price < absoluteMin ) {
                    absoluteMin = datum.price;
                }
                if( datum.price > absoluteMax ) {
                    absoluteMax = datum.price
                }
            }
            
            tickerAllTimeLow[ticker] = absoluteMin;
            tickerAllTimeHigh[ticker] = absoluteMax;
            const percentDistance =
                (getCurrentValue(ticker)  - tickerAllTimeLow[ticker])
                / (tickerAllTimeHigh[ticker] - tickerAllTimeLow[ticker]);

            percentDistanceFromAllTimeLow[ticker] = percentDistance;

            if( percentDistance < 0.10 ) { countWithinTenPercent++; }
    }
    
    // is the current value at least a 10% return?
    // sell it all!
    for( const ticker of tickers ) {
        
        const percentDistance =
                ( tickerAllTimeHigh[ticker] - getCurrentValue(ticker) )
                / (tickerAllTimeHigh[ticker] - tickerAllTimeLow[ticker]);

        if( 
            getAveragePurchasePrice(ticker) > 0
            && ( percentDistance ) < 0.10
        ) {
            sellStock(ticker, getStockBalance(ticker) );
        }
    }

    const walletBalance = getWalletBalance();

    // get the percentage distance from the all time low
    const allocatedFunds = Math.floor(walletBalance / countWithinTenPercent);
    for( const ticker of tickers ) {
        if( percentDistanceFromAllTimeLow[ticker] < 0.10 ) {

            const purchaseQuantity = Math.floor(allocatedFunds / getCurrentValue(ticker));

            if( purchaseQuantity > 0 ) {
                buyStock( ticker, purchaseQuantity );
            }
        }
    }

    // if out of time, sell everything!
    if( getRemainingTime() === 1 ) {
        for( const ticker of tickers ) {
            sellStock( ticker, getStockBalance(ticker));
        }
    }
}

function percentageBasedWithStopLossAndLocalMinimums() { 
    const tickerAllTimeLow = {};
    const tickerAllTimeHigh = {};
    const percentDistanceFromAllTimeLow = {};
    let countWithinTenPercent = 0;
    
    // preprocessing data
    for( const ticker of tickers ) {
            // calculate the 30 second local minimum
            const historicalData = getHistoricalValue(ticker, 60);
            
            let absoluteMin = 10000;
            let absoluteMax = 0;
            for( const datum of historicalData ) {
                if( datum.price < absoluteMin ) {
                    absoluteMin = datum.price;
                }
                if( datum.price > absoluteMax ) {
                    absoluteMax = datum.price
                }
            }
            
            tickerAllTimeLow[ticker] = absoluteMin;
            tickerAllTimeHigh[ticker] = absoluteMax;
            const percentDistance =
                (getCurrentValue(ticker)  - tickerAllTimeLow[ticker])
                / (tickerAllTimeHigh[ticker] - tickerAllTimeLow[ticker]);

            percentDistanceFromAllTimeLow[ticker] = percentDistance;

            if( percentDistance < 0.10 ) { countWithinTenPercent++; }
    }
    
    // is there a 10% return
    // OR 20% loss?
    // sell it all!
    for( const ticker of tickers ) {
        const averagePurchasePrice = getAveragePurchasePrice(ticker);
        if( averagePurchasePrice <= 0 ) continue;
        const currentReturnPercentage = (getCurrentValue(ticker) - averagePurchasePrice) / averagePurchasePrice;
        if( 
            getAveragePurchasePrice(ticker) > 0
            && (
                currentReturnPercentage > 0.10 // profit!
                || currentReturnPercentage < 0 // stop loss!
            )
        ) {
            sellStock(ticker, getStockBalance(ticker) );
        }
    }

    const walletBalance = getWalletBalance();

    // get the percentage distance from the all time low
    const allocatedFunds = Math.floor(walletBalance / tickers.length);
    for( const ticker of tickers ) {
        if( percentDistanceFromAllTimeLow[ticker] < 0.10 ) {

            const purchaseQuantity = Math.floor(allocatedFunds / getCurrentValue(ticker));

            if( purchaseQuantity > 0 ) {
                buyStock( ticker, purchaseQuantity );
            }
        }
    }

    if( getRemainingTime() === 1 ) {
        for( const ticker of tickers ) {
            sellStock( ticker, getStockBalance(ticker));
        }
    }
}

function chatGPT() {
    const remainingTime = getRemainingTime();

  tickers.forEach(ticker => {
    const currentPrice = getCurrentValue(ticker);
    
    // Get only the last 10 data points
    const historicalData = getHistoricalValue(ticker, 10); 
    if (historicalData.length === 0) return; // Ensure we have data to analyze

    const averagePrice = historicalData.reduce((sum, data) => sum + data.price, 0) / historicalData.length;

    if (getWalletBalance() > currentPrice && currentPrice < averagePrice * buyThreshold) {
      // Buy if current price is significantly lower than recent average
      const quantityToBuy = Math.floor(getWalletBalance() / currentPrice);
      if (quantityToBuy > 0) {
        buyStock(ticker, quantityToBuy);
      }
    }

    const currentStockBalance = getStockBalance(ticker);
    const averagePurchasePrice = getAveragePurchasePrice(ticker);

    if (currentStockBalance > 0 && currentPrice > averagePurchasePrice * sellThreshold) {
      // Sell if current price is significantly higher than average purchase price
      sellStock(ticker, currentStockBalance);
    }
  });

  // Ensure all stocks are sold near the end of the game
  if (remainingTime <= 10) {
    tickers.forEach(ticker => {
      const currentStockBalance = getStockBalance(ticker);
      if (currentStockBalance > 0) {
        sellStock(ticker, currentStockBalance);
      }
    });
  }
}