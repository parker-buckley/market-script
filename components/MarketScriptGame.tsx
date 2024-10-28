"use client"

import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Play, Pause, RotateCcw } from 'lucide-react'

// Sample stock data generator
const generateStockData = (
  ticker: string
  , numPoints = 20
) => {
  let price = Math.random() * 100 + 50
  return Array.from({ length: numPoints }, (_, i) => ({
    time: i,
    price: (price += Math.random() * 10 - 5).toFixed(2)
  }))
}

// Sample stock tickers
const stockTickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB', 'TSLA', 'NVDA', 'NFLX']

export default function MarketScriptGame() {
  const [editorContent, setEditorContent] = useState("// Write your JavaScript here\nconsole.log('Hello, stocks!');\n")
  const [isRunning, setIsRunning] = useState(false)
  const [stockData, setStockData] = useState({})

  useEffect(() => {
    // Initialize stock data
    const initialData: Record<string, { time: number, price: string }[]>  = {}
    stockTickers.forEach(ticker => {
      initialData[ticker] = generateStockData(ticker)
    })

    setStockData(initialData)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setStockData(prevData => {

          const newData: Record<string, { time:number, price:string}[]> = { ...prevData }
          
          Object.keys(newData).forEach(ticker => {
            const lastPrice = parseFloat(newData[ticker][newData[ticker].length - 1].price)
            newData[ticker] = [
              ...newData[ticker].slice(1),
              { time: newData[ticker].length, price: (lastPrice + Math.random() * 2 - 1).toFixed(2) }
            ]
          })
          
          console.log( 'newData', newData );

          return newData;
       
        }
      )
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleEditorChange = (value: string) => {
    setEditorContent(value)
  }

  const executeScript = () => {
    try {
      // eslint-disable-next-line no-new-func
      const scriptFunction = new Function(editorContent)
      scriptFunction()
      setIsRunning(true)
    } catch (error) {
      console.error('Error executing script:', error)
    }
  }

  const pauseScript = () => {
    setIsRunning(false)
  }

  const resumeScript = () => {
    setIsRunning(true)
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
          <Button onClick={resumeScript} disabled={isRunning}>
            <RotateCcw className="mr-2 h-4 w-4" /> Resume
          </Button>
        </div>
        <Editor
          height="90%"
          defaultLanguage="javascript"
          defaultValue={editorContent}
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </div>
      <ScrollArea className="w-1/2 p-4">
        <div className="grid grid-cols-2 gap-4">
          {stockTickers.map(ticker => (
            <Card key={ticker} className="w-full">
              <CardHeader>
                <CardTitle>{ticker}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stockData[ticker]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
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