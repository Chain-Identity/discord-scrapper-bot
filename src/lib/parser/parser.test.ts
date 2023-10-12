import { expect, test } from 'vitest'
import { parseMessage, parseUsername } from './index'


test('parse username 1', () => {
  const username = parseUsername('**Daes**')
  expect(username).toBe('Daes')
})

test('parse username 2', () => {
  const username = parseUsername('> **wonk 🌸**:')
  expect(username).toBe('wonk 🌸')
})

test('parse username 3', () => {
  const username = parseUsername('> **flint**: \"are you allowed')
  expect(username).toBe('flint')
})

test('parse username 3', () => {
  const username = parseUsername('**Ansem 🎒**\n\nnot sure why')
  expect(username).toBe('Ansem 🎒')
})

test('parse username 4', () => {
  const username = parseUsername('> **cheb (online) 🐲**')
  expect(username).toBe('cheb (online) 🐲')
})

test('parse message 1', () => {
  const message = parseMessage(`> **Daes**: \"Are there any Punjabi album collectors? \"`);
  if(message.type === 'unknown') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('Daes')
  expect(message.message).toBe('Are there any Punjabi album collectors?')
})

test('parse message 2', () => {
  const message = parseMessage(`> **wonk 🌸**: \"what u playing on that\"`);
  if(message.type === 'unknown') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('wonk 🌸')
  expect(message.message).toBe('what u playing on that')
})

test('parse message 3', () => {
  const message = parseMessage(`> **flint**: \"are you allowed to say that word?\"`);
  if(message.type === 'unknown') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('flint')
  expect(message.message).toBe('are you allowed to say that word?')
})

test('parse message 3', () => {
  const message = parseMessage(`**Ansem 🎒**\n\nnot sure why`);
  if(message.type === 'unknown') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('Ansem 🎒')
  expect(message.message).toBe('not sure why')
})

test('parse reply 1', () => {
  const message = parseMessage(`**requisiem**
> June: "but yeah when perps and larger caps aren’t dead I trade those , lately have been trading low caps and doing sniping here and there"
ill bother you more about this in your chat in a lil`);
  if(message.type !== 'quote') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('requisiem')
  expect(message.message).toBe('ill bother you more about this in your chat in a lil')
  expect(message.quoteUsername).toBe('June')
  expect(message.quote).toBe('but yeah when perps and larger caps aren’t dead I trade those , lately have been trading low caps and doing sniping here and there')
})

test('parse reply 2', () => {
  const message = parseMessage(`**requisiem**
> cozygrail.eth: "any plans to bring your ft key value back up? "
just using this space as an occasional mental dump to give value back, the actual $ amount doesn't matter to me but i'm aware enough to understand that some people bought higher and there's a little tinge in my mind to take care of them lol`);
  if(message.type !== 'quote') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('requisiem')
  expect(message.message).toBe('just using this space as an occasional mental dump to give value back, the actual $ amount doesn\'t matter to me but i\'m aware enough to understand that some people bought higher and there\'s a little tinge in my mind to take care of them lol')
  expect(message.quoteUsername).toBe('cozygrail.eth')
  expect(message.quote).toBe('any plans to bring your ft key value back up?')
})

test('parse reply 3', () => {
  const message = parseMessage(`**requisiem**
> seaweed: "or do you see all of this as noise, you said historically now is a good time to buy. maybe i should just focus on stacking eth and ignoring the usd values since we are already 50% off aths"
missed this one somehow so just getting to it.

i think you should always have at least 20-50% (depending on ur tolerance) kept in stables no matter the price of coins because you never know when the next black swan hits. imo if you're already in with a decent split just focus on stacking the eth for whatever your goal is for 2024/2025. 

for reference a rough allo of my port which i think is very  very risky for my tate lol

3mil in eth staked
1.75mil in tradfi banking
500k in stables on chain
750k in long term shitcoin holds
about 50k for daily apes`);
  if(message.type !== 'quote') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('requisiem')
  expect(message.message).toBe('missed this one somehow so just getting to it.\n\ni think you should always have at least 20-50% (depending on ur tolerance) kept in stables no matter the price of coins because you never know when the next black swan hits. imo if you\'re already in with a decent split just focus on stacking the eth for whatever your goal is for 2024/2025. \n\nfor reference a rough allo of my port which i think is very  very risky for my tate lol\n\n3mil in eth staked\n1.75mil in tradfi banking\n500k in stables on chain\n750k in long term shitcoin holds\nabout 50k for daily apes')

  expect(message.quoteUsername).toBe('seaweed')
  expect(message.quote).toBe('or do you see all of this as noise, you said historically now is a good time to buy. maybe i should just focus on stacking eth and ignoring the usd values since we are already 50% off aths')
})


test('parse old reply', () => {
  const message = parseMessage(`Replying to dragos:
  > "Fuck it, love this man’s bullishness, lemme buy a 2nd key 🫡 just added more eth here lmao"
 
 thanks dragos! bought another of yours also.`);
  if(message.type !== 'quote') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('')
  expect(message.message).toBe('thanks dragos! bought another of yours also.')
  expect(message.quoteUsername).toBe('dragos')
  expect(message.quote).toBe('Fuck it, love this man’s bullishness, lemme buy a 2nd key 🫡 just added more eth here lmao')
})

test('parse old 2', () => {
  const message = parseMessage(`Loma (8/31/2023, 11:40:55 PM): "Re: DYDX  Epoch ended a day or two ago, that supply should be hitting the market in another 4-5 days which will make for an interesting short setup if people can hold prices at this $2.20-2.26 area.  Would be a pretty easy new short position imo. A little gust of air and it'll fall once the supply hits + Dec. unlock anticipation"`);
  if(message.type !== 'inline') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('Loma')
  expect(message.message).toBe(`Re: DYDX  Epoch ended a day or two ago, that supply should be hitting the market in another 4-5 days which will make for an interesting short setup if people can hold prices at this $2.20-2.26 area.  Would be a pretty easy new short position imo. A little gust of air and it'll fall once the supply hits + Dec. unlock anticipation`)
})

test('parse old 2 reply', () => {
  const message = parseMessage(`> davis 🐺🦊: "Did all of CT miss cyber?"

  **Loma** (_02 Sep 2023 03:38:06 GMT_)
Hahaha basically.   It was a mix of:  1. Every prior pump kind of just fizzling out on most shitcoins. Most action was on-chain.  2. BTC looked like dog shit or was actively nuking.  It is what it is hahahaha`);
  if(message.type !== 'quote') {
    throw new Error('unknown')
  }
  expect(message.username).toBe('Loma')
  expect(message.message).toBe(`Hahaha basically.   It was a mix of:  1. Every prior pump kind of just fizzling out on most shitcoins. Most action was on-chain.  2. BTC looked like dog shit or was actively nuking.  It is what it is hahahaha`)
  expect(message.quoteUsername).toBe('davis 🐺🦊')
  expect(message.quote).toBe('Did all of CT miss cyber?')
})
