import yargs from 'yargs';

export async function parseArguments() {
  return yargs(process.argv.slice(2))
    .usage('Usage: $0 --url <url> [--save]')
    .option('url', {
      alias: 'u',
      describe: 'The URL to scrape images from',
      type: 'string',
      demandOption: true,
    })
    .option('save', {
      alias: 's',
      describe: 'Save the scraped image URLs to a file',
      type: 'boolean',
      default: false,
    })
    .help().argv;
}
