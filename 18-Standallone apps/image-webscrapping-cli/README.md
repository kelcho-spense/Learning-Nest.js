# Building a Standalone NestJS Application for Web Scraping

NestJS is a versatile framework that can go beyond server-based applications. In this guide, we’ll focus on building a  **NestJS standalone application** , showcasing how to utilize its modular structure and dependency injection to create a CLI-based tool for web scraping. This application will use **[yargs](https://github.com/yargs/yargs)** for command-line input and **[cheerio](https://github.com/cheeriojs/cheerio)** to extract image URLs from a webpage.


### Why a Standalone NestJS Application?

While NestJS is often associated with server-based applications, it also provides the ability to create standalone applications without the overhead of an HTTP server. This makes it ideal for tasks like CLI tools, batch processing, or utilities such as a web scraper.

As the NestJS docs states:

> There are several ways of mounting a Nest application. You can create a web app, a microservice or just a bare Nest **standalone application** (without any network listeners). The Nest standalone application is a wrapper around the Nest  **IoC container** , which holds all instantiated classes. We can obtain a reference to any existing instance from within any imported module directly using the standalone application object. Thus, you can take advantage of the Nest framework anywhere, including, for example, scripted **CRON** jobs. You can even build a **CLI** on top of it.

So we can take advantage of the great Nest features like dependency injection and modular architecture to better organize our scripts, without exposing an HTTP server. Let’s see how we can create a web scraper CLI program!


### Prerequisites

Before we start, ensure you have:

* Node.js and npm installed on your system.
* Basic understanding of TypeScript and NestJS.

### Setting Up the Project

Run the following commands to create a new NestJS project:

```
npm install -g @nestjs/cli 
```

```
nest new nestjs-standalone
```

```
cd nestjs-standalone
```

Add the required packages for web scraping and CLI input handling:


```bash

pnpm add yargs cheerio axios
```

### Writing the Standalone Application

#### `main.ts`

The `main.ts` file is the entry point of the standalone application. This is where we initialize the NestJS application context using the `createApplicationContext` method. This approach is specifically designed for standalone applications, allowing us to run the application without starting an HTTP server.

The `bootstrap` function manages the application’s lifecycle, handling command-line input via `parseArguments` and orchestrating the invocation of the `ScraperService`. Delegating command-line argument parsing to a separate file keeps the main file clean and focused on its primary purpose.

```typescript
import{NestFactory}from'@nestjs/core';
import{AppModule}from'./app.module';
import{ScraperService}from'./scraper.service';
import{parseArguments}from'./args';

asyncfunctionbootstrap(){
const{url,save}=awaitparseArguments();
constapp=awaitNestFactory.createApplicationContext(AppModule);
constscraperService=app.get(ScraperService);
awaitscraperService.scrape(url,save);
awaitapp.close();
}

bootstrap();
```

#### `args.ts`

The `args.ts` file is responsible for setting up and parsing command-line arguments using the `yargs` library. It defines the structure of the expected inputs, including required options like `--url` and optional flags such as `--save`. By centralizing this logic, the file ensures that command-line validation is standardized and separated from the core application logic, making the application easier to maintain and extend.


```typescript

import yargs from'yargs';

exportasyncfunctionparseArguments(){
returnyargs(process.argv.slice(2))
.usage('Usage: $0 --url <url> [--save]')
.option('url',{
      alias:'u',
      describe:'The URL to scrape images from',
      type:'string',
      demandOption:true,
})
.option('save',{
      alias:'s',
      describe:'Save the scraped image URLs to a file',
      type:'boolean',
      default:false,
})
.help().argv;
}
```

#### `app.module.ts`

The `AppModule` is the root module, which ties together the application components and services.

```typescript
import{Module}from'@nestjs/common';
import{ScraperService}from'./scraper.service';

@Module({
imports: [],
controllers: [],
providers: [ScraperService],
})
exportclassAppModule{}
```

#### `scraper.service.ts`

The `ScraperService` encapsulates all the web scraping logic, keeping the implementation modular and testable. It uses `axios` to fetch the HTML content of the target URL and `cheerio` to parse and extract image sources. If the `save` parameter is true, the service also writes the scraped image URLs to a file.

```typescript
import{Injectable}from'@nestjs/common';
import axios from'axios';
import*as cheerio from'cheerio';
import{writeFileSync}from'fs';

@Injectable()
exportclassScraperService{
asyncscrape(url:string,save:boolean):Promise<string[]>{
try{
console.log(`Fetching data from ${url}...`);
constresponse=awaitaxios.get(url);

const$=cheerio.load(response.data);

constimages=$('img')
.map((i,el)=>$(el).attr('src'))
.get()
.filter((src)=>!!src);

if (images.length>0) {
console.log('Scraped Images:');
images.forEach((image,index)=>{
console.log(`${index +1}: ${image}`);
});

if (save) {
writeFileSync('images.txt',images.join('\n'),'utf8');
console.log('Image URLs saved to images.txt');
}
}

returnimages;
}catch (error) {
console.error('Error occurred while scraping:',error.message);
return [];
}
}
}
```

### Running the Standalone Application

Compile the TypeScript code:

```bash
pnpm run build
```

Execute the application using the CLI:

```bash
node dist/main.js --url=https://www.kevincomba.online/
```

To save the results to a file:

```bash
node dist/main.js --url=https://www.kevincomba.online/ --save
```

Example Output:

```bash
Fetching data from https://www.kevincomba.online/...
Scraped Images:
1: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/HtPlmYMJL1tXG3g/Kelcho-logo.webp  
2: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/_nswfohfcPM8__B/kevin-mvp-award.webp  
3: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/uJZfU4lqIBgPV3m/KirinyagaUniversityLogo.webp
4: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/k1DNfttSmTrrcJc/ALXLogo.webp
5: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/Dbv9p8pSk-7QVCw/BrigdeCollageLogo.webp
6: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/50LGHaKlMnaS651/KBHS.webp
7: https://images.reactbricks.com/original/5a717763-afd5-4ec5-8a68-12a0d6e4fd08/react.svg
8: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/e6kXid1tibhkbO4/Expressjs.webp  
9: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/ayr_gK_gSTnre63/honojs.webp
10: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/yPz-MedpgZ_pteF.webp
11: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/fjJVF2rr7tlxmjX/nextjs.webp
12: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/QQK9vqOnVmLu1AL/nodejs.webp
13: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/MSuCB1JQzlVNGO1/tailwind.webp  
14: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/RiekQ3THGt0LwaY/shadcnui.webp  
15: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/Q6q5cfYzfoCUjZv/daisyUI.webp
16: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/zdJ5jX22oKNe_na/dotnet.webp
17: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/3qeWLgGW26L7abv/azurecosmosdb.webp   
18: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/2Mxy-a7Y_eBQzhD/mongodb.webp
19: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/YJV2XWsIQhQIvDG/mssql.webp
20: https://assets.reactbricks.com/IqMJwBfHvfppEd1/images/original/lrsZ-60Xaz9FhAM/posgresql.webp
Image URLs saved to images.txt
Scraping completed!
```

### Advantages of NestJS Standalone Applications

1. **Modularity** : Reuse services, modules, and providers across different parts of your project.
2. **Dependency Injection** : Simplifies managing dependencies in a clean and scalable way.
3. **Flexibility** : No need for an HTTP server, making it lightweight and efficient for tasks like CLI tools.

### Conclusion

By leveraging the power of NestJS standalone applications, we built a modular and reusable web scraper that extracts image sources from web pages. This approach showcases the flexibility of NestJS beyond traditional server-based applications. With just a few enhancements, this scraper can be extended to handle more complex tasks like downloading images, handling pagination, or integrating with APIs.

No longer do we have to sacrifice organizational structure and robust architecture when creating custom scripts. Even the simplest of programs can take advantage of the great features NestJS offers us.
