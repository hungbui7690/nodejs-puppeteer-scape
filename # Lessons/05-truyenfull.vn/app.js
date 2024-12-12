require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const fs = require('fs')
const winston = require('winston')

puppeteer.use(
  require('puppeteer-extra-plugin-user-preferences')({
    userPrefs: {
      safebrowsing: {
        enabled: false,
        enhanced: false,
      },
    },
  })
)

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

  const url =
    'https://truyenwikidich.net/truyen/do-thi-hat-giong-vuong/chuong-1-khong-thuan-y-nhan-sinh-WHY8I6rYUDL4FDZ%7E'
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  let count = url.split('/').at(5).split('-').at(1)
  let fileTitle = ''

  await page.waitForNetworkIdle()

  while (await page.$('.top-bar.ankhito > p.center > a:last-child')) {
    try {
      await page.waitForNetworkIdle()
      const textContent = await page.evaluate(() => {
        const title =
          document.querySelector('#bookContent > p.book-title:nth-child(2) ')
            ?.innerText + '\n\n'
        const content =
          document.querySelector('#bookContentBody')?.innerText + '\n\n\n\n\n\n'

        return { title, content }
      })

      fileTitle = Math.floor(count / 50) + 1

      fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
      fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

      const link = await page.$('.top-bar.ankhito > p.center > a:last-child')
      const newURL = await link?.evaluate((el) => el.getAttribute('href'))
      await page.goto(`https://truyenwikidich.net${newURL}`, {
        waitUntil: 'domcontentloaded',
      })

      count++
    } catch (error) {
      console.log(error)
      await page.reload()
    }
  }

  await browser.close()
}

scrapeData()
