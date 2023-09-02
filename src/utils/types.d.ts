export interface AdvancedSocketMethods {
  /* The `awaitFor` method in the `AdvancedSocketMethod` interface is used to wait for a specific
    event (`ev`) to occur. It takes an optional `callback` function that can be used to filter the
    events based on certain conditions. The `callback` function should return `true` if the event
    should be processed, and `false` otherwise. */
  awaitFor(ev: string, callback?: (...args: any[]) => boolean): Promise<any>

  /* The `request` method in the `AdvancedSocketMethod` interface is used to send a request to the
    server using the specified event name (`ev`) and any additional arguments (`args`). It returns a
    `Promise` that resolves with the response from the server. */
  request(ev: string, ...args: any[]): Promise<any>
}
