/*
  Prevent Password Manager 
  - to disable password manager or password changes warning in puppeteer -> use puppeteer-extra
    -> npm install puppeteer-extra puppeteer-extra-plugin-user-preferences


*/

require('dotenv').config()
const puppeteer = require('puppeteer-extra')
const fs = require('fs')

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

const scrapeData = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(
    'https://metruyencv.com/truyen/vu-luyen-dien-phong/chuong-951',
    {
      waitUntil: 'domcontentloaded',
    }
  )
  let count = 951

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
    await page.waitForNetworkIdle()
    const textContent = await page.evaluate(() => {
      const title = document.querySelector('h2')?.textContent + '\n\n'
      const content =
        document.querySelector(
          'div[data-x-bind="ChapterContent"]'
          // '#chapter-detail'
        )?.textContent + '\n\n'
      const loadMore =
        document.querySelector('div#load-more')?.textContent + '\n\n\n\n\n'

      return { title, content, loadMore }
    })

    fileTitle = Math.floor(count / 50) + 1
    textContent.content = textContent.content.replace('.', '. ')
    textContent.content = textContent.content.replace('·', '')
    textContent.loadMore = textContent.loadMore.replace('.', '. ')
    textContent.loadMore = textContent.loadMore.replace('·', '')

    fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.loadMore, { flag: 'a' })

    const nextButton = await page.$('button[data-x-bind="GoNext"]')
    await nextButton?.click()
    await page.waitForNavigation()

    count++
  }

  // await browser.close()
}

scrapeData()
