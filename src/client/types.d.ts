export type Payload<Type extends String> = {
    type: Type
    space: string
    [key: string]: any
  }
  
export type ReaderPayload = Payload<'reader'>
export type WriterPayload = Payload<'writer'>
  
export interface ReaderGuard {
    sendRequestPayloadOnClusterConnect?: (payload: ReaderPayload) => ReaderPayload
    sendRequestPayloadOnServerConnect?: (payload: ReaderPayload) => ReaderPayload
  }
  
export interface WriterGuard {
    sendRequestPayloadOnClusterConnect?: (payload: WriterPayload) => WriterPayload
    sendRequestPayloadOnServerConnect?: (payload: WriterPayload) => WriterPayload
  }

export type * as utils from './utils'