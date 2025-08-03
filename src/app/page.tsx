
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Code, Languages, RotateCcw, ArrowRight } from 'lucide-react';
import { snippets } from '@/lib/code';
import { cn } from '@/lib/utils';

type Language = keyof typeof snippets;
const languages = Object.keys(snippets) as Language[];
const timeOptions = [15, 30, 60, 120, 180];
type TestType = 'time' | 'full';

export default function CodeTypePage() {
  const [language, setLanguage] = useState<Language>('javascript');
  const [testType, setTestType] = useState<TestType>('time');
  const [time, setTime] = useState(30);
  const [code, setCode] = useState('');
  const [typed, setTyped] = useState('');
  const [timer, setTimer] = useState(time);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [status, setStatus] = useState<'waiting' | 'running' | 'finished'>('waiting');
  const [errorCount, setErrorCount] = useState(0);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0 });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getNewCode = useCallback(() => {
    const langSnippets = snippets[language];
    const newSnippet = langSnippets[Math.floor(Math.random() * langSnippets.length)];
    setCode(newSnippet);
  }, [language]);

  useEffect(() => {
    getNewCode();
  }, [getNewCode]);

  const resetTest = useCallback(() => {
    setStatus('waiting');
    setTimer(time);
    setTyped('');
    setStartTime(null);
    setErrorCount(0);
    getNewCode();
    if (intervalRef.current) clearInterval(intervalRef.current);
    inputRef.current?.focus();
  }, [time, getNewCode]);
  
  useEffect(() => {
    if (status === 'running') {
      inputRef.current?.focus();
      if (testType === 'time') {
        intervalRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              setStatus('finished');
              if (intervalRef.current) clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (testType === 'full' && startTime === null) {
        setStartTime(Date.now());
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, testType, startTime]);
  
  useEffect(() => {
    setTimer(time);
    resetTest();
  }, [time, language, resetTest, testType]);

  useEffect(() => {
    if (status === 'finished') {
      let durationInMinutes = 0;
      if (testType === 'time') {
        durationInMinutes = time / 60;
      } else if (startTime) {
        durationInMinutes = (Date.now() - startTime) / (1000 * 60);
      }

      if (durationInMinutes > 0) {
        const wordsTyped = typed.length / 5;
        const wpm = Math.round(wordsTyped / durationInMinutes);
  
        const totalTyped = typed.length;
        const accuracy = totalTyped > 0 ? Math.round(((totalTyped - errorCount) / totalTyped) * 100) : 100;
  
        setStats({ wpm, accuracy: Math.max(0, accuracy) });
      } else {
        setStats({ wpm: 0, accuracy: 100 });
      }
    }
  }, [status, typed, time, testType, startTime, errorCount]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.key === 'Tab') {
      resetTest();
      return;
    }

    if (status === 'finished') return;
    
    if (status === 'waiting') {
      setStatus('running');
      return; // First keypress only starts the test
    }

    if (e.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) { // Regular character
      if (typed.length < code.length) {
        const charToType = code[typed.length];
        if (e.key !== charToType) {
          setErrorCount(prev => prev + 1);
        }
        setTyped(prev => prev + e.key);
      }
    }
    
    if (typed.length + 1 === code.length && testType === 'full' && e.key.length === 1 && e.key !== 'Backspace') {
      setStatus('finished');
    }
  };
  
  const characters = useMemo(() => {
    return code.split('').map((char, index) => {
      const isTyped = index < typed.length;
      const isCorrect = isTyped ? typed[index] === char : null;
      const isCurrent = index === typed.length;
      
      return {
        char,
        className: cn(
          'transition-colors duration-200 ease-in-out',
          {
            'text-muted-foreground': !isTyped,
            'text-foreground': isCorrect,
            'text-destructive bg-destructive/20 rounded-sm': isCorrect === false,
            'cursor-blink relative': isCurrent && status !== 'finished',
            'text-glow-primary': isCurrent && status !== 'finished',
          }
        )
      };
    });
  }, [code, typed, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8 font-body">
      <header className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary text-glow-primary">CodeType</h1>
        <p className="text-muted-foreground mt-2">How fast can you code?</p>
      </header>

      <main className="w-full max-w-4xl mx-auto space-y-8">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
            <div className="flex items-center gap-2">
              <Code className="text-primary" />
              <Tabs defaultValue={testType} onValueChange={(v) => setTestType(v as TestType)}>
                <TabsList>
                  <TabsTrigger value="time">Time</TabsTrigger>
                  <TabsTrigger value="full">Full</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="text-primary" />
              <Select onValueChange={(v) => setLanguage(v as Language)} defaultValue={language}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {testType === 'time' && (
              <div className="flex items-center gap-2">
                <Clock className="text-primary" />
                <Tabs defaultValue={String(time)} onValueChange={(v) => setTime(Number(v))}>
                  <TabsList>
                    {timeOptions.map(t => (
                      <TabsTrigger key={t} value={String(t)}>{t}s</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="relative">
          <Card 
            className="overflow-hidden relative"
            onClick={() => inputRef.current?.focus()}
          >
            <CardContent className="p-6 md:p-8">
              <div 
                className={cn(
                  "font-code text-lg md:text-xl tracking-wider leading-relaxed whitespace-pre-wrap break-words",
                )}
              >
                {characters.map((item, index) => (
                  <span key={index} className={item.className}>
                    {item.char === '\n' ? '↵\n' : item.char}
                  </span>
                ))}
              </div>
              <input
                ref={inputRef}
                type="text"
                className="absolute inset-0 w-full h-full opacity-0 cursor-default p-0 m-0"
                onKeyDown={handleKeyDown}
                autoFocus
              />
               {status === 'waiting' && (
                <div 
                  className="absolute inset-0 bg-transparent flex items-center justify-center rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.focus();
                    setStatus('running');
                  }}
                >
                  <p className="text-2xl font-bold animate-pulse">Click here or start typing to begin</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-card/50">
              <p className="text-3xl font-bold font-mono text-primary">{status === 'running' && testType === 'time' ? timer : ' '}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">Tab</span>
                <ArrowRight size={16} />
                <span>Next Test</span>
              </div>
              <Button variant="ghost" size="icon" onClick={resetTest}>
                <RotateCcw />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {status === 'finished' && (
          <Card className="bg-card/50 backdrop-blur-sm text-center animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">Results</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">WPM</p>
                  <p className="text-4xl font-bold text-accent text-glow-accent">{stats.wpm}</p>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-4xl font-bold">{stats.accuracy}%</p>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-4xl font-bold text-destructive">{errorCount}</p>
                </div>
            </CardContent>
            <CardFooter className="justify-center p-4">
              <Button onClick={resetTest} size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

