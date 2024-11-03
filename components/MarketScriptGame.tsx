"use client"

import Editor from '@monaco-editor/react'
import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, DollarSignIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useInterval } from '@/app/hooks/useInterval'

import { 
  TickerTags
  , StockData
  , StockAveragePurchasePrice
  , HighScoreData
} from './types/global'
import { 
  calculateRollingAverage
  , changeVolatility
  , generateStockData 
} from '../lib/utils'
import { RenderHighScores } from './HighScores'
import { readGist, updateGist } from '@/lib/gist/gist'
import { 
  GAME_TIME_LIMIT
  , MARKET_REFESH_SPEED
  , NUM_POINTS
  , stockTickerBalances
  , stockTickers
  , stockTickerValues
  , tickerMaxValues
  , tickerVolatilities
  , highScoreData
} from '@/lib/constants'
import { Input } from './ui/input'

let readOnly: boolean = false;
let time = NUM_POINTS;
let GAME_CLOCK = 0;

export default function MarketScriptGame() {
  // eslint-disable-next-line prefer-const
  let [editorContent, setEditorContent] = useState(
    `// Write your JavaScript to execute every second

/*  Utilize the MarketScript library to interact with the market:
    getCurrentValue( tickerName: string ): number
    getHistoricalValue( tickerName: string, lookBackQuantity?: number): { time: number, price: number }[]
    buyStock( tickerName: string, quantity: number ): boolean
    sellStock( tickerName: string, quantity: number ): boolean
    getAveragePurchasePrice( tickerName: string ): number
    getStockBalance( tickerName: string ): number
    getWalletBalance(): number
    getRemainingTime(): number // this is the number of seconds remaining in the game
*/

const {
  getCurrentValue
  , getHistoricalValue
  , buyStock
  , sellStock
  , getAveragePurchasePrice
  , getStockBalance
  , getWalletBalance
  , getRemainingTime
} = MarketScript;

const tickers = ['AAPL','GOOGL','MSFT','AMZN','FB','TSLA','NVDA','NFLX','VRY'];

console.log(getCurrentValue('AAPL'));`
);
  const [isEditorRunning, setIsEditorRunning] = useState(false);
  const [isMarketRunning, setIsMarketRunning] = useState(false);
  const [stockData, setStockData] = useState<StockData>({ AAPL: [], GOOGL: [], MSFT: [], AMZN: [], FB: [], TSLA: [], NVDA: [], NFLX: [], VRY: [], TRBA: [] });
  const [stockAveragePurchasePrice, setStockAveragePurchasePrice] = useState<StockAveragePurchasePrice>({ AAPL: 0, GOOGL: 0, MSFT: 0, AMZN: 0, FB: 0, TSLA: 0, NVDA: 0, NFLX: 0, VRY: 0, TRBA: 0 });
  const [walletBalance, setWalletBalance] = useState<number>( 1000 );
  const [isGameOver, setIsGameOver] = useState<boolean>( false );
  const [isGameStarted, setIsGameStarted] = useState<boolean>( false );
  const [playerName, setPlayerName] = useState<string>( '' );

  useEffect(() => {
    // Initialize stock data
    const initialData: StockData  = { AAPL: [], GOOGL: [], MSFT: [], AMZN: [], FB: [], TSLA: [], NVDA: [], NFLX: [], VRY: [], TRBA: [] }
    stockTickers.forEach(ticker => {
      initialData[ticker] = generateStockData(ticker);
    })

    setStockData(initialData);
  }, [])

  const walletBalanceRef = useRef(walletBalance);
  const stockAveragePurchasePriceRef = useRef(stockAveragePurchasePrice);

  // Keep the refs updated with the latest state on each render
  useEffect(() => {
    walletBalanceRef.current = walletBalance;
  }, [walletBalance]);

  useEffect(() => {
    stockAveragePurchasePriceRef.current = stockAveragePurchasePrice;
  }, [stockAveragePurchasePrice]);
  

  const [flashEffect, setFlashEffect] = useState<Record<string, string | null>>({});
  const flashEffectRef = useRef(flashEffect);
  useEffect(() => { flashEffectRef.current = flashEffect }, [flashEffect]);

  const gameClockRef = useRef(GAME_CLOCK);
  useEffect(() => { gameClockRef.current = GAME_CLOCK }, [GAME_CLOCK]);

  useInterval(async ()=>{
    if( isGameStarted && !isGameOver ) {
      GAME_CLOCK += MARKET_REFESH_SPEED;
      if( GAME_CLOCK >= GAME_TIME_LIMIT ) {
        await triggerEndGame();
      }
    }
  }, 1000);

  const resetHighScoreData = async ( name: string, score?: number ) => {
    
    let localHighScoreData: HighScoreData = await readGist();
    if( name && score ) {
      localHighScoreData.push({ 
        name
        , score
        , date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\//g, '-')
      });

      localHighScoreData.sort((a,b) => b.score - a.score);
      await updateGist(JSON.stringify(localHighScoreData));

      highScoreData.splice(0);
      for( const datum of localHighScoreData ) {
        highScoreData.push(datum);
      }
    } else {
      highScoreData.splice(0);
      localHighScoreData.sort((a,b) => b.score - a.score);

      for( const datum of localHighScoreData ) {
        highScoreData.push(datum);
      }
    }

  }

  useInterval(async () => {
    if (isMarketRunning) {
        time++;

        if( time % 30 ) {
          changeVolatility();
        }

        setStockData(prevData => {

          const newData: StockData = { ...prevData }
          
          Object.keys(newData).forEach(ticker => {
            const tickerTag = ticker as TickerTags;
            const tickerVolatility = tickerVolatilities[tickerTag];

            const lastPrice = newData[tickerTag][newData[tickerTag].length - 1].price;
            const tickerMax = tickerMaxValues[tickerTag];

            let newPrice: number = 0;

            if( ticker === TickerTags.Trba ) {
              newPrice = Math.round(lastPrice - tickerVolatility / 4);
  
              while( newPrice < 0 || newPrice > tickerMax) {
                if( newPrice <= 0 ) { break; }
                newPrice = Math.round(lastPrice - tickerVolatility / 4);
              }
            } else {
              newPrice = Math.round(lastPrice + Math.random() * tickerVolatility - tickerVolatility / 2);
  
              while( newPrice < 0 || newPrice > tickerMax) {
                newPrice = Math.round(lastPrice + Math.random() * tickerVolatility - tickerVolatility / 2);
              }
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
    }
    if (isEditorRunning) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const marketScriptInstructionSet: Record<string, Function> = {};
                  
      const getCurrentValue = (ticker: TickerTags) => { return stockData[ticker][stockData[ticker].length - 1].price };

      const getWalletBalance = () => { return walletBalanceRef.current };

      const buyStock = (ticker: TickerTags, quantity: number) => { 
        if (ticker === TickerTags.Trba) return true;

        const currentPrice = stockData[ticker][stockData[ticker].length - 1].price;
        const totalCost = currentPrice * quantity;
      
        if (walletBalanceRef.current >= totalCost) {
          stockTickerBalances[ticker] += quantity;
          setWalletBalance(prevBalance => {
            walletBalanceRef.current = prevBalance - totalCost;
            return walletBalanceRef.current;
          });
      
          const currentAverage = stockAveragePurchasePriceRef.current[ticker];
          const currentQuantity = stockTickerBalances[ticker];
          const newAverage = calculateRollingAverage(currentAverage, currentQuantity, quantity, currentPrice);
      
          setStockAveragePurchasePrice(prevPrices => {
            const updatedPrices = { ...prevPrices, [ticker]: newAverage };
            stockAveragePurchasePriceRef.current = updatedPrices;
            return updatedPrices;
          });
      
          setFlashEffect((prev) => ({ ...prev, [ticker]: 'red' }));

          setTimeout(() => {
            setFlashEffect((prev) => ({ ...prev, [ticker]: null }));
          }, 100);

          return true;
        }
      
        return false;
      }

      const sellStock = (ticker: TickerTags, quantity: number) => { 
        const currentPrice = stockData[ticker][stockData[ticker].length - 1].price;
        const currentQuantity = stockTickerBalances[ticker];
        const totalGain = currentPrice * quantity;
      
        if (currentQuantity >= quantity) {
          stockTickerBalances[ticker] -= quantity;
      
          if (stockTickerBalances[ticker] === 0) {
            setStockAveragePurchasePrice(prevPrices => {
              const updatedPrices = { ...prevPrices, [ticker]: 0 };
              stockAveragePurchasePriceRef.current = updatedPrices;
              return updatedPrices;
            });
          }
      
          setWalletBalance(prevBalance => {
            walletBalanceRef.current = prevBalance + totalGain;
            return walletBalanceRef.current;
          });
      
          setFlashEffect((prev) => ({ ...prev, [ticker]: 'green' }));

          setTimeout(() => {
            setFlashEffect((prev) => ({ ...prev, [ticker]: null }));
          }, 100 );

          return true;
        }
      
        return false;
      };

      const getHistoricalValue = (ticker: TickerTags, lookBackQuantity?: number): Record<number,number>[] => {
        
        if( !lookBackQuantity ) lookBackQuantity = NUM_POINTS;
        
        if( lookBackQuantity <= NUM_POINTS) {
          const allStockData = stockData[ticker];
          return allStockData.slice( NUM_POINTS - lookBackQuantity, NUM_POINTS);
        } else {
          return stockData[ticker];
        }
      }

      const getAveragePurchasePrice = (ticker: TickerTags): number => {
        return stockAveragePurchasePriceRef.current[ticker];
      }

      const getStockBalance = (ticker: TickerTags): number => { return stockTickerBalances[ticker]; }

      const getRemainingTime = (): number => {
        return ( (GAME_TIME_LIMIT -  gameClockRef.current) / 1000 );
      }

      marketScriptInstructionSet['getCurrentValue'] = getCurrentValue;
      marketScriptInstructionSet['getWalletBalance'] = getWalletBalance;
      marketScriptInstructionSet['buyStock'] = buyStock;
      marketScriptInstructionSet['sellStock'] = sellStock;
      marketScriptInstructionSet['getHistoricalValue'] = getHistoricalValue;
      marketScriptInstructionSet['getAveragePurchasePrice'] = getAveragePurchasePrice;
      marketScriptInstructionSet['getStockBalance'] = getStockBalance;
      marketScriptInstructionSet['getRemainingTime'] = getRemainingTime;

      const scriptFunction = new Function('MarketScript', editorContent);

      const scriptPromise = async () => {
        try {
          const result = await scriptFunction(marketScriptInstructionSet, editorContent);
          return result;
        } catch (error) {
          console.error('Script execution error:', error);
        }
      };
  
      await scriptPromise();
    }  
  }, MARKET_REFESH_SPEED);


  const handleEditorChange = (value: string | undefined): void => {
    setEditorContent(value || '');
  }

  const executeScript = () => {
    try {
      setIsEditorRunning(true)
      readOnly = true;
    } catch (error) {
      console.error('Error executing script:', error)
    }
  }

  const pauseScript = () => {
    setIsEditorRunning(false)
    readOnly = false;
  }

  const transferToBank = () => {
    
  }

  const transferToWallet = () => {

  }

  const triggerEndGame = async() => {
    await resetHighScoreData( playerName, walletBalanceRef.current);
    setIsGameOver( true );
    setIsEditorRunning( false );
    setIsMarketRunning( false );
    
  }

  const triggerStartGame = () => {
    setIsGameStarted( currentState => !currentState);
    setIsMarketRunning( currentState => !currentState);
  }

  const triggerRestart = () => {
    const initialData: StockData  = { AAPL: [], GOOGL: [], MSFT: [], AMZN: [], FB: [], TSLA: [], NVDA: [], NFLX: [], VRY: [], TRBA: [] }
    stockTickers.forEach(ticker => {
      initialData[ticker] = generateStockData(ticker);
    })

    GAME_CLOCK = 0;
    setWalletBalance(1000);
    setStockData(initialData);
    setStockAveragePurchasePrice({ AAPL: 0, GOOGL: 0, MSFT: 0, AMZN: 0, FB: 0, TSLA: 0, NVDA: 0, NFLX: 0, VRY: 0, TRBA: 0 });
    setIsGameStarted( false );
    setIsGameOver( false );
  }

  return (
    <div className="flex h-screen bg-background">
      <Dialog open={!isGameStarted}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>MarketScript - Tutorial</DialogTitle>
            <DialogDescription>
              <br/>Welcome to MarketScript, the original stock market scripting game!<br/><br/>
              The rules are simple:<br/>

              1. Use the MarketScript API to buy, sell, and more!<br/>
              2. You have 5 minutes to maximize your profit (or lose it all!)<br/>
              3. Your code will be ran every second<br/>
              4. Set a high score on the leaderboard!<br/>
              <br/><br/>
              Good Luck!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <label htmlFor="playerName" className="text-sm font-medium">
                User Name
            </label>
            <Input
                id="playerName"
                placeholder="name for hi-score..."
                className="border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                onChange={( (e) => { setPlayerName(e.target.value) })}
            />
            <Button onClick={triggerStartGame} disabled={(playerName === '')}>Get Started</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isGameOver}>
        <DialogContent className="sm:max-w-[600px] h-1/2">
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              You finished with ${walletBalance}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="w-1/2 p-4">
              { RenderHighScores( highScoreData ) }
          </ScrollArea>
          <DialogFooter>
            <Button onClick={triggerRestart}>Start Over</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-1/2 p-4 flex flex-col">
        <div className="mb-4 flex space-x-2">
          <Button onClick={executeScript} disabled={isEditorRunning || isGameOver || !isGameStarted}>
            <Play className="mr-2 h-4 w-4" /> Execute
          </Button>
          <Button onClick={pauseScript} disabled={!isEditorRunning || isGameOver || !isGameStarted}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button onClick={transferToWallet} disabled={isEditorRunning || isGameOver || !isGameStarted}>
            <DollarSignIcon className="mr-2 h-4 w-4" /> Wallet Transfer
          </Button>
          <Button onClick={transferToBank} disabled={isEditorRunning}>
            <DollarSignIcon className="mr-2 h-4 w-4" /> Bank Transfer
          </Button>
          <h1 className='text-4xl text-right w-full'>{Math.floor((GAME_TIME_LIMIT-gameClockRef.current) / 60000)}m:{(GAME_TIME_LIMIT-gameClockRef.current)%60000 / 1000}s</h1>
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
            <Card key={ticker} className={`w-full h-64 ${
              flashEffect[ticker] === 'green' ? 'bg-green-200' : flashEffect[ticker] === 'red' ? 'bg-red-200' : 'bg-inherent'
            } transition-colors duration-300`}>
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