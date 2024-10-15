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
  const browser = await puppeteer.launch({
    headless: false,
    // args: [`--proxy-server=${process.env.PROXY}`],
  })
  const page = await browser.newPage()

  let count = 1
  let isLogin = false
  await page.goto('https://metruyencv.com/truyen/dai-dao-vo-cuc/chuong-1', {
    waitUntil: 'domcontentloaded',
  })

  // **************** LOGIN ****************
  if (!isLogin) {
    // click on hamburger button to open menu
    const hamburger = await page.$('button[data-x-bind="OpenModal(\'menu\')"]')
    await hamburger.click()

    // click on login button to open login modal
    const loginButton = await page.$(
      'button[data-x-bind="OpenModal(\'login\')"]'
    )
    await loginButton.click()

    // enter email and password -> then submit
    const emailInput = await page.$('input[data-x-model="form.email"]')
    const passwordInput = await page.$('input[data-x-model="form.password"]')
    await emailInput.type(process.env.EMAIL)
    await passwordInput.type(process.env.PASSWORD)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await page.waitForNetworkIdle()
    await page.reload()
    isLogin = true
  }

  // **************** LOGIN ****************

  let fileTitle = ''
  const isLoadMore = await page.$('#load-more')

  // while (await page.$('button[data-x-bind="GoNext"]')) {
  const textContent = await page.evaluate(() => {
    const title = document.querySelector('h2')?.textContent + '\n'
    let content = document.querySelector(
      'div[data-x-bind="ChapterContent"]'
    )?.textContent
    console.log(content)
    // content += document.querySelector('#load-more')?.textContent + '\n\n\n\n'
    console.log('load-more', document.querySelector('#load-more'))
    content.replaceAll('·', '')
    content.replaceAll('.', '. ')

    const login = document.querySelector(
      'div[data-x-show="mustLogin"]'
    )?.textContent

    return { title, content, login }
  })

  fileTitle = Math.floor(count / 50) + 1

  fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
  fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })
  fs.writeFileSync(`./${fileTitle}.txt`, textContent.login, { flag: 'a' })

  const nextButton = await page.$('button[data-x-bind="GoNext"]')
  await nextButton?.click()
  await page.waitForNavigation()

  count++
  // }

  // await browser.close()
}

scrapeData()
