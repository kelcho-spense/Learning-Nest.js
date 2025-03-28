import { 
    WebSocketGateway, 
    SubscribeMessage, 
    MessageBody,
    WsResponse
  } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Observable, from } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @WebSocketGateway({
    namespace: 'advanced',
    cors: {
      origin: '*',
    },
  })
  export class AdvancedGateway {
    private logger: Logger = new Logger('AdvancedGateway');
  
    // Simple response with data extraction
    @SubscribeMessage('identify')
    handleIdentify(@MessageBody('name') name: string): WsResponse<string> {
      this.logger.log(`Received identification request for: ${name}`);
      return { event: 'identified', data: `Hello, ${name}!` };
    }
  
    // Multiple responses using Observable
    @SubscribeMessage('countdown')
    handleCountdown(@MessageBody() count: number): Observable<WsResponse<number>> {
      this.logger.log(`Starting countdown from: ${count}`);
      
      // Create an array of numbers from count down to 1
      const countdownArray = Array.from({ length: count }, (_, i) => count - i);
      
      return from(countdownArray).pipe(
        map(item => ({ 
          event: 'countdown', 
          data: item 
        }))
      );
    }
    
    // Async response with promise
    @SubscribeMessage('asyncOperation')
    async handleAsync(@MessageBody() data: any): Promise<WsResponse<string>> {
      this.logger.log('Received async operation request');
      
      // Simulate an async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        event: 'asyncResult',
        data: `Processed ${JSON.stringify(data)} asynchronously`
      };
    }
  }