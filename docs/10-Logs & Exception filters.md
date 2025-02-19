# Logging and Exception Filtering in NestJS

This documentation covers the implementation of a custom logging system and global exception handling in our NestJS application.

## Custom Logger Implementation

### LoggerService

The `LoggerService` extends NestJS's built-in `ConsoleLogger` and adds file logging capabilities. It's located in `src/logger/logger.service.ts`.

Key features:
- Writes logs to both console and file
- Handles multiple log levels (error, warn, log)
- Includes timestamp and IP address in log entries
- Creates a `logs` directory if it doesn't exist
- Uses Africa/Nairobi timezone for timestamps

Example usage:
```typescript
@Injectable()
class MyService {
  constructor(private logger: LoggerService) {}

  someMethod() {
    this.logger.log('This is a log message', 'MyService', '192.168.1.1');
    this.logger.error('This is an error', 'MyService', '192.168.1.1');
    this.logger.warn('This is a warning', 'MyService', '192.168.1.1');
  }
}
```

## Global Exception Filter

### AllExceptionsFilter

The `AllExceptionsFilter` (`src/http-exception.filter.ts`) provides centralized exception handling for the entire application.

Features:
- Catches all exceptions (HTTP, Prisma, and general errors)
- Formats error responses consistently
- Logs errors with IP address tracking
- Handles different types of exceptions:
  - HttpException
  - PrismaClientValidationError
  - General Error objects

Response format:
```json
{
  "statusCode": number,
  "timestamp": "ISO date string",
  "path": "request URL",
  "response": "error message or object"
}
```

### IP Address Handling

The system includes robust IP address detection:
- Supports X-Forwarded-For header
- Falls back to request.ip
- Handles both array and string formats of forwarded IPs
- Configured to trust proxy headers in main.ts

## Setup and Configuration

1. Register the exception filter globally in `main.ts`:
```typescript
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
```

2. Enable proxy trust for accurate IP detection:
```typescript
app.set('trust proxy', true);
```

3. Import LoggerModule where needed:
```typescript
@Module({
  imports: [LoggerModule],
  // ...
})
```

## Log File Structure

Logs are stored in the `logs/myLogFile.log` directory with the following format:
```
MM/DD/YY, HH:MM AM/PM - IP: xxx.xxx.xxx.xxx - [Context] Message
```

## Error Status Codes

- HTTP Exceptions: Original status code
- Prisma Validation Errors: 422 (Unprocessable Entity)
- Unhandled Exceptions: 500 (Internal Server Error)

## Best Practices

1. Always inject LoggerService instead of using console.log
2. Include context when logging for better traceability
3. Use appropriate log levels (error, warn, log)
4. Handle sensitive information appropriately in logs
5. Monitor log file size and implement rotation if needed

## Example Exception Handling

```typescript
try {
  // Some operation
} catch (error) {
  // The exception filter will automatically:
  // 1. Log the error with IP
  // 2. Format the response
  // 3. Send appropriate status code
  throw error;
}
```
