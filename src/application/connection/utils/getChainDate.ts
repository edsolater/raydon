import { connectionAtom } from '../atom'

export const getChainDate = () => new Date(Date.now() + (connectionAtom.get().chainTimeOffset ?? 0))
