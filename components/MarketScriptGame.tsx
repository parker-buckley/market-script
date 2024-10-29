"use client"

import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Play, Pause, DollarSignIcon } from 'lucide-react'
import { 
  TickerTags
  , StockTickerValues
  , StockTickerBalances
  , StockAveragePurchasePrice
  , TickerMaxValues
  , StockData 
} from './types/global'

// Sample stock tickers
const stockTickers: TickerTags[] = Object.values( TickerTags );
const stockTickerValues: StockTickerValues = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0}
const stockTickerBalances: StockTickerBalances = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0};
const stockAveragePurchasePrice: StockAveragePurchasePrice = {'AAPL': 0, 'GOOGL': 0, 'MSFT': 0, 'AMZN': 0, 'FB': 0, 'TSLA': 0, 'NVDA': 0, 'NFLX': 0, 'VRY': 0, 'TRBA': 0};
const tickerMaxValues: TickerMaxValues = {'AAPL': 250, 'GOOGL': 400, 'MSFT': 300, 'AMZN': 350, 'FB': 150, 'TSLA': 100, 'NVDA': 500, 'NFLX': 300, 'VRY': 300, 'TRBA': 100};
let readOnly: boolean = false;

let VOLATILITY = 10;
const VOLATILITY_MAX = 20;
const NUM_POINTS = 200;
let time = NUM_POINTS;

// Sample stock data generator
const generateStockData = (
  ticker: TickerTags
  , numPoints = NUM_POINTS
) => {
  let price = Math.round(Math.random() * 50) + 50
  const arr = [];

  for( let i = 0; i < numPoints; i++ ) {
    let newPrice = Math.round(price + Math.random() * VOLATILITY - VOLATILITY / 2);
    const tickerMax = tickerMaxValues[ticker];
  
    while( newPrice < 0 || newPrice > tickerMax) {
      newPrice = Math.round(newPrice + Math.random() * VOLATILITY - VOLATILITY / 2);
    }

    arr[i] = { time: i, price: newPrice };
    price = newPrice;
  }

  return arr;
}

const calculateRollingAverage =( currentAverage: number, currentQuantity:number,  addedQuantity: number, addedPrice: number ): number => {
  const rawRollingAverage = ( currentAverage * currentQuantity + (addedPrice * addedQuantity)) / ( currentQuantity + addedQuantity );
  return Math.round(rawRollingAverage * 100) / 100;
}

export default function MarketScriptGame() {
  // eslint-disable-next-line prefer-const
  let [editorContent, setEditorContent] = useState(
`// Write your JavaScript to execute every second

// Utilize the MarketScript library to interact with the market:

//  getCurrentValue( tickerName: string ): number
//  getHistoricalValue( tickerName: string, lookBackQuantity: number): Record<number,number>[]
//  buyStock( tickerName: string, quantity: number ): boolean
//  sellStock( tickerName: string, quantity: number ): boolean
//  getAveragePurchasePrice( tickerName: string ): number

console.log(MarketScript.getCurrentValue('AAPL'));\n`
  );
  const [isRunning, setIsRunning] = useState(false);
  const [stockData, setStockData] = useState<StockData>({ AAPL: [], GOOGL: [], MSFT: [], AMZN: [], FB: [], TSLA: [], NVDA: [], NFLX: [], VRY: [], TRBA: [] });
  const [walletBalance, setWalletBalance] = useState<number>( 1000 );
  // const [bankBalance, setBankBalance] = useState<number>( 3565 );

  useEffect(() => {
    // Initialize stock data
    const initialData: StockData  = { AAPL: [], GOOGL: [], MSFT: [], AMZN: [], FB: [], TSLA: [], NVDA: [], NFLX: [], VRY: [], TRBA: [] }
    stockTickers.forEach(ticker => {
      initialData[ticker] = generateStockData(ticker);
    })

    setStockData(initialData);
  }, [])
  
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {

        time++;

        if( time % 30 ) {
          VOLATILITY = Math.round( Math.random() * VOLATILITY_MAX )
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const marketScriptInstructionSet: Record<string, Function> = {};
                    
        const getCurrentValue = (ticker: TickerTags) => { return stockData[ticker][stockData[ticker].length - 1].price };
        const getWalletBalance = () => { return walletBalance };
        const buyStock = (ticker: TickerTags, quantity: number) => { 
          const currentPrice = stockData[ticker][stockData[ticker].length - 1].price;
          const totalCost = currentPrice * quantity;
          if( walletBalance >= totalCost ) {
            stockTickerBalances[ticker] = stockTickerBalances[ticker] + quantity
          } else {
            return false;
          }

          const currentAverage = stockAveragePurchasePrice[ticker];
          const currentQuantity = stockTickerBalances[ticker];

          stockAveragePurchasePrice[ticker] = calculateRollingAverage( currentAverage, currentQuantity, quantity, currentPrice );
          setWalletBalance( walletBalance - totalCost );
          return true;
        };
        const sellStock = (ticker: TickerTags, quantity: number) => { 
          const currentPrice = stockData[ticker][stockData[ticker].length - 1].price;
          const currentQuantity = stockTickerBalances[ticker];
          const totalGain = currentPrice * quantity;
          
          if( currentQuantity >= quantity ) {
            stockTickerBalances[ticker] = currentQuantity - quantity
            if( stockTickerBalances[ticker] === 0 ) { stockAveragePurchasePrice[ticker] = 0; }
          } else {
            return false;
          }

          setWalletBalance( walletBalance + totalGain );
          return true;
        };
        const getHistoricalValue = (ticker: TickerTags, lookBackQuantity: number): Record<number,number>[] => {
          if( lookBackQuantity <= NUM_POINTS) {
            const allStockData = stockData[ticker];
            return allStockData.slice( NUM_POINTS - lookBackQuantity, NUM_POINTS);
          } else {
            return stockData[ticker];
          }
        }
        const getAveragePurchasePrice = (ticker: TickerTags): number => {
          return stockAveragePurchasePrice[ticker];
        }

        marketScriptInstructionSet['getCurrentValue'] = getCurrentValue;
        marketScriptInstructionSet['getWalletBalance'] = getWalletBalance;
        marketScriptInstructionSet['buyStock'] = buyStock;
        marketScriptInstructionSet['sellStock'] = sellStock;
        marketScriptInstructionSet['getHistoricalValue'] = getHistoricalValue;
        marketScriptInstructionSet['getAveragePurchasePrice'] = getAveragePurchasePrice;

        const scriptFunction = new Function('MarketScript', editorContent)
        scriptFunction(marketScriptInstructionSet, editorContent)
    
        /* 
          After running the user script, update stock data
        */
        setStockData(prevData => {

          const newData: StockData = { ...prevData }
          
          Object.keys(newData).forEach(ticker => {
            const tickerTag = ticker as TickerTags;

            const lastPrice = newData[tickerTag][newData[tickerTag].length - 1].price;
            let newPrice = Math.round(lastPrice + Math.random() * VOLATILITY - VOLATILITY / 2);
            const tickerMax = tickerMaxValues[tickerTag];

            while( newPrice < 0 || newPrice > tickerMax) {
              newPrice = Math.round(lastPrice + Math.random() * VOLATILITY - VOLATILITY / 2);
            }

            stockTickerValues[tickerTag] = newPrice;
            // shift the array an create a new element at the end
            newData[tickerTag].shift();
            newData[tickerTag] = [
              ...newData[tickerTag], { time, price: newPrice }
            ]
          })

          return newData;
        } )
      }, 1000)
    }

    return () => clearInterval(interval)

  }, [isRunning, editorContent, stockData, walletBalance])

  const handleEditorChange = (value: string | undefined): void => {
    setEditorContent(value || '');
  }

  const executeScript = () => {
    try {
      setIsRunning(true)
      readOnly = true;
    } catch (error) {
      console.error('Error executing script:', error)
    }
  }

  const pauseScript = () => {
    setIsRunning(false)
    readOnly = false;
  }

  const transferToBank = () => {
    
  }

  const transferToWallet = () => {

  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/2 p-4 flex flex-col">
        <div className="mb-4 flex space-x-2">
          <Button onClick={executeScript} disabled={isRunning}>
            <Play className="mr-2 h-4 w-4" /> Execute
          </Button>
          <Button onClick={pauseScript} disabled={!isRunning}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button onClick={transferToWallet} disabled={isRunning}>
            <DollarSignIcon className="mr-2 h-4 w-4" /> Wallet Transfer
          </Button>
          <Button onClick={transferToBank} disabled={isRunning}>
            <DollarSignIcon className="mr-2 h-4 w-4" /> Bank Transfer
          </Button>
        </div>
        <div className="mb-4 flex space-x-2 items-center">
          <h2>Wallet: {walletBalance}</h2>
          <h2>Bank: <small>coming soon</small></h2>
        </div>
        <Editor
          height="90%"
          defaultLanguage="javascript"
          defaultValue={editorContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{readOnly}}
        />
      </div>
      <ScrollArea className="w-1/2 p-4">
        <div className="grid grid-cols-2 gap-4">
          {stockTickers.map(ticker => (
            <Card key={ticker} className="w-full h-64">
              <CardHeader className='flex-row items-center'>
                <CardTitle>{ticker}</CardTitle>
                  <p className='ml-auto'>Price: ${stockTickerValues[ticker]}</p>
                  <p className='ml-auto'>Bal: {stockTickerBalances[ticker]}</p>
                  <p className='ml-auto'>Position: {stockAveragePurchasePrice[ticker]}</p>
              </CardHeader>
              <CardContent className='w-full h-full'>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stockData[ticker as keyof typeof stockData]} height={200} width={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}