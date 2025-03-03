### Caching

Caching is a powerful and straightforward **technique** for enhancing your application's performance. By acting as a temporary storage layer, it allows for quicker access to frequently used data, reducing the need to repeatedly fetch or compute the same information. This results in faster response times and improved overall efficiency.

#### Installation

To get started with caching in Nest, you need to install the `@nestjs/cache-manager` package along with the `cache-manager` package.

```bash

npm install @nestjs/cache-manager cache-manager
```

By default, everything is stored in memory; Since `cache-manager` uses [Keyv](https://keyv.org/docs/) under the hood, you can easily switch to a more advanced storage solution, such as Redis, by installing the appropriate package. We'll cover this in more detail later.

#### In-memory cache

To enable caching in your application, import the `CacheModule` and configure it using the `register()` method:

content_copy

```typescript

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}
```

This setup initializes in-memory caching with default settings, allowing you to start caching data immediately.

#### Auto-caching responses

> **Warning** In [GraphQL](https://docs.nestjs.com/graphql/quick-start) applications, interceptors are executed separately for each field resolver. Thus, `CacheModule` (which uses interceptors to cache responses) will not work properly.

To enable auto-caching responses, just tie the `CacheInterceptor` where you want to cache data.

```typescript

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

> **Warning** Only `GET` endpoints are cached. Also, HTTP server routes that inject the native response object (`@Res()`) cannot use the Cache Interceptor. See [response mapping](https://docs.nestjs.com/interceptors#response-mapping) for more details.

To reduce the amount of required boilerplate, you can bind `CacheInterceptor` to all endpoints globally:

#### Time-to-live (TTL)

The default value for `ttl` is `0`, meaning the cache will never expire. To specify a custom [TTL](https://en.wikipedia.org/wiki/Time_to_live), you can provide the `ttl` option in the `register()` method, as demonstrated below:

```typescript

CacheModule.register({
  ttl: 5000, // milliseconds
});
```

#### Use module globally

When you want to use `CacheModule` in other modules, you'll need to import it (as is standard with any Nest module). Alternatively, declare it as a [global module](https://docs.nestjs.com/modules#global-modules) by setting the options object's `isGlobal` property to `true`, as shown below. In that case, you will not need to import `CacheModule` in other modules once it's been loaded in the root module (e.g., `AppModule`).

```typescript

CacheModule.register({
  isGlobal: true,
});
```

#### Global cache overrides

While global cache is enabled, cache entries are stored under a `CacheKey` that is auto-generated based on the route path. You may override certain cache settings (`@CacheKey()` and `@CacheTTL()`) on a per-method basis, allowing customized caching strategies for individual controller methods. This may be most relevant while using [different cache stores.](https://docs.nestjs.com/techniques/caching#different-stores)

You can apply the `@CacheTTL()` decorator on a per-controller basis to set a caching TTL for the entire controller. In situations where both controller-level and method-level cache TTL settings are defined, the cache TTL settings specified at the method level will take priority over the ones set at the controller level.

```typescript

@Controller()
@CacheTTL(50)
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}
```

> **Hint** The `@CacheKey()` and `@CacheTTL()` decorators are imported from the `@nestjs/cache-manager` package.

#### Cache stores

Switching to a different cache store is straightforward. First, install the appropriate package. For example, to use Redis, install the `@keyv/redis` package:

```bash

npm install @keyv/redis
```

With this in place, you can register the `CacheModule` with multiple stores as shown below:

```typescript

import { Module } from '@nestjs/common';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
 	  ttl: 10000,   // 10 seconds
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

In this example, we've registered two stores: `CacheableMemory` and `KeyvRedis`. The `CacheableMemory` store is a simple in-memory store, while `KeyvRedis` is a Redis store. The `stores` array is used to specify the stores you want to use. The first store in the array is the default store, and the rest are fallback stores.

Check out the [Keyv documentation](https://keyv.org/docs/) for more information on available stores.
