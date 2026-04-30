'use client'

import { useState } from 'react'
import { CardShell, SectionHeader } from '@/lib/utils'
import { Binary, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CopyBtn } from '@/lib/utils'

const ENCODINGS = ['base64', 'url', 'hex', 'html']

export default function EncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [encoding, setEncoding] = useState('base64')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleConvert = () => {
    if (!input) return
    try {
      let result = ''
      switch (encoding) {
        case 'base64':
          result = mode === 'encode' ? btoa(input) : atob(input)
          break
        case 'url':
          result = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
          break
        case 'hex':
          if (mode === 'encode') {
            result = Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join('')
          } else {
            const bytes = input.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []
            result = new TextDecoder().decode(new Uint8Array(bytes))
          }
          break
        case 'html':
          if (mode === 'encode') {
            result = input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
          } else {
            result = input.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          }
          break
      }
      setOutput(result)
    } catch {
      setOutput('Error: Invalid input for this encoding')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput(input)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Encoder/Decoder" description="Encode and decode data using various encoding schemes" />
      <CardShell>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={encoding} onValueChange={setEncoding}>
              <SelectTrigger className="w-full sm:w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="Encoding" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {ENCODINGS.map((e) => (
                  <SelectItem key={e} value={e} className="text-zinc-300 focus:text-emerald-400 uppercase">{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => setMode('encode')}
                variant={mode === 'encode' ? 'default' : 'outline'}
                className={mode === 'encode' ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'border-zinc-700 text-zinc-300 hover:text-emerald-400'}
              >
                <Binary className="w-4 h-4 mr-2" />Encode
              </Button>
              <Button
                onClick={() => setMode('decode')}
                variant={mode === 'decode' ? 'default' : 'outline'}
                className={mode === 'decode' ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'border-zinc-700 text-zinc-300 hover:text-emerald-400'}
              >
                <Binary className="w-4 h-4 mr-2" />Decode
              </Button>
            </div>
            <div className="flex-1" />
            <Button onClick={handleSwap} variant="ghost" className="text-zinc-400 hover:text-emerald-400">
              <ArrowRightLeft className="w-4 h-4 mr-2" />Swap
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400 font-medium">{mode === 'encode' ? 'Input' : 'Encoded'}</label>
                <CopyBtn text={input} />
              </div>
              <Textarea
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter encoded text...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 font-mono text-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400 font-medium">{mode === 'encode' ? 'Output' : 'Decoded'}</label>
                <CopyBtn text={output} />
              </div>
              <Textarea
                placeholder="Result will appear here..."
                value={output}
                readOnly
                className="min-h-[200px] bg-zinc-800/50 border-zinc-700 text-emerald-400 placeholder:text-zinc-500 font-mono text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleConvert} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </Button>
          </div>
        </div>
      </CardShell>
    </div>
  )
}
