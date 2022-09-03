/*****************
 ** connection's type *
 *****************/

import { Connection as _Connection } from '@solana/web3.js'

export interface UserCustomizedEndpoint {
  name: string
  url: string
  isUserCustomized: true
}

export interface Endpoint {
  name?: string
  url: string
  weight?: number
  isUserCustomized?: true
}

export interface Config {
  strategy: 'speed' | 'weight'
  success: boolean
  rpcs: Endpoint[]
}

export type Connection = _Connection
