const puppeteer = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth')
const winston = require('winston')
const { executablePath } = require('puppeteer')
const fs = require('fs')

puppeteer.use(pluginStealth())

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'combined.log',
    }),
    new winston.transports.File({
      filename: 'app-error.log',
      level: 'error',
    }),
  ],
})

const scrapeData = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  // ·
  const url = 'https://truyenyy.app/truyen/han-ngu-chi-ruc-ro/chuong-1.html'
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  let count = +url.slice(url.lastIndexOf('-') + 1, url.lastIndexOf('.html'))
  console.log(count)

  let fileTitle = ''

  while (await page.$('.weui-btn_primary')) {
    try {
      await page.waitForNetworkIdle()
      const textContent = await page.evaluate(() => {
        const title =
          document.querySelector('.chap-title > span')?.innerText + '\n\n'
        const content =
          document.querySelector('#inner_chap_content_1')?.innerText +
          '\n\n\n\n\n\n'

        return { title, content }
      })

      fileTitle = Math.floor(count / 50) + 1

      fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
      fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

      const link = await page.$('.weui-btn_primary')
      const newURL = await link?.evaluate((el) => el.getAttribute('href'))
      await page.goto(`https://truyenyy.vip${newURL}`, {
        waitUntil: 'domcontentloaded',
      })

      console.log(count, textContent.title)

      count++
    } catch (error) {
      logger.error(new Error('Error while scraping'))
      await page.reload()
    }
  }

  await browser.close()
}

scrapeData()
//
