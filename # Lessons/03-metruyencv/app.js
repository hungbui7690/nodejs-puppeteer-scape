/*
  Prevent Password Manager 
  - to disable password manager or password changes warning in puppeteer -> use puppeteer-extra
    -> npm install puppeteer-extra puppeteer-extra-plugin-user-preferences


*/

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

  // Hollywood Truyền Kỳ Đạo Diễn
  // https://metruyencv.com/truyen/hollywood-truyen-ky-dao-dien/chuong-1

  // Ta Chỉ Muốn An Tĩnh Chơi Game
  // https://metruyencv.com/truyen/ta-chi-muon-an-tinh-choi-game/chuong-1

  // ·
  const url =
    'https://metruyencv.com/truyen/ta-chi-muon-an-tinh-lam-cau-dao-ben-trong-nguoi/chuong-1440'
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })
  let count = +url.slice(url.lastIndexOf('-') + 1)

  // **************** LOGIN ****************
  const hamburger = await page.$('button[data-x-bind="OpenModal(\'menu\')"]')
  await hamburger.click()

  const loginButton = await page.$('button[data-x-bind="OpenModal(\'login\')"]')
  await loginButton.click()

  // enter email and password -> then submit
  const emailInput = await page.$('input[data-x-model="form.email"]')
  const passwordInput = await page.$('input[data-x-model="form.password"]')
  await emailInput.type(process.env.EMAIL)
  await passwordInput.type(process.env.PASSWORD)
  await page.waitForNetworkIdle()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.waitForNetworkIdle()
  await page.$eval('button[data-x-bind="CloseModal"]', (el) => el.click())

  // ********************************

  let fileTitle = ''

  while (await page.$('button[data-x-bind="GoNext"]')) {
    try {
      console.log('0')
      // await page.waitForNetworkIdle({ idleTime: 1000 })
      console.log('1')
      const textContent = await page.evaluate(() => {
        const title = document.querySelector('h2')?.textContent + '\n\n'
        const content =
          document.querySelector('#chapter-detail')?.innerText + '\n\n\n\n\n\n'
        return { title, content }
      })
      console.log('2')
      // console.log(textContent.content)
      console.log(count, textContent.title)
      fileTitle = Math.floor(count / 50) + 1
      fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
      fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, {
        flag: 'a',
      })

      logger.info(`Scraped ${fileTitle}.txt - ${textContent.title}`)
    } catch (error) {
      logger.error(new Error('Error while scraping'))
      await page.reload()
    }

    const nextButton = await page.$('button[data-x-bind="GoNext"]')
    await nextButton?.click()
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    count++
  }

  await browser.close()
}

scrapeData()
