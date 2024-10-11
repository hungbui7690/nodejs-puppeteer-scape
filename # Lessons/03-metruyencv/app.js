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
    'https://metruyencv.com/truyen/hai-tac-chi-ban-lau-vuong/chuong-1',
    { waitUntil: 'domcontentloaded' }
  )

  // **************** LOGIN ****************
  // click on hamburger button to open menu
  const hamburger = await page.$('button[data-x-bind="OpenModal(\'menu\')"]')
  await hamburger.click()

  // click on login button to open login modal
  const loginButton = await page.$('button[data-x-bind="OpenModal(\'login\')"]')
  await loginButton.click()

  // enter email and password -> then submit
  const emailInput = await page.$('input[data-x-model="form.email"]')
  const passwordInput = await page.$('input[data-x-model="form.password"]')
  await emailInput.type(process.env.EMAIL)
  await passwordInput.type(process.env.PASSWORD)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.reload()

  // **************** LOGIN ****************

  let count = 1
  let fileTitle = ''

  while (await page.$('button[data-x-bind="GoNext"]')) {
    const textContent = await page.evaluate(() => {
      const title = document.querySelector('h2')?.textContent
      const content = document.querySelector(
        'div[data-x-bind="ChapterContent"]'
      )?.textContent

      return { title, content }
    })

    fileTitle = Math.floor(count / 50) + 1

    fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

    const nextButton = await page.$('button[data-x-bind="GoNext"]')
    await nextButton?.click()
    await page.waitForNavigation()

    count++
  }

  await browser.close()
}

scrapeData()
