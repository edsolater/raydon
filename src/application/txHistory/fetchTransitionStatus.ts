import { HexAddress } from '@/types/constants'
import { Connection } from '../connection'

export default async function fetchTransitionStatus(txids: HexAddress[], connection: Connection) {
  return connection.getSignatureStatuses(txids, { searchTransactionHistory: true }).then(({ value: result }) => result)
}
