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
    'https://truyen.tangthuvien.vn/doc-truyen/34261-nhan-dao-dai-thanh/chuong-02',
    {
      waitUntil: 'domcontentloaded',
    }
  )
  let count = 1
  let fileTitle = ''

  await page.waitForNetworkIdle({ idleTime: 2000 })

  while (await page.$('a.bot-next_chap.bot-control')) {
    await page.waitForNetworkIdle({ idleTime: 2000 })
    const textContent = await page.evaluate(() => {
      const title = document.querySelector('h2')?.textContent + '\n\n'
      const content =
        document.querySelector('.box-chap')?.innerText + '\n\n\n\n\n\n'
      return { title, content }
    })

    fileTitle = Math.floor(count / 50) + 1
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

    const nextButton = await page.$('a.bot-next_chap.bot-control')
    await nextButton?.click()
    await page.waitForNavigation()

    count++
  }

  // await browser.close()
}

scrapeData()
