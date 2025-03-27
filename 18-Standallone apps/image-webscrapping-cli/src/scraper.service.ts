import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

@Injectable()
export class ScraperService {
  async scrape(url: string, save: boolean): Promise<string[]> {
    try {
      console.log(`Fetching data from ${url}...`);
      const response = await axios.get(url);

      const $ = cheerio.load(response.data);

      const images = $('img')
        .map((i, el) => $(el).attr('src'))
        .get()
        .filter((src) => !!src);

      if (images.length > 0) {
        console.log('Scraped Images:');
        images.forEach((image, index) => {
          console.log(`${index + 1}: ${image}`);
        });

        if (save) {
          writeFileSync('images.txt', images.join('\n'), 'utf8');
          console.log('Image URLs saved to images.txt');
        }
      }

      return images;
    } catch (error) {
      console.error('Error occurred while scraping:', error.message);
      return [];
    }
  }
}