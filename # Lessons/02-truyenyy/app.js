const puppeteer = require('puppeteer')
const fs = require('fs')

const scrapeData = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(
    'https://truyenyy.vip/truyen/giai-tri-theo-nam-2004-bat-dau/chuong-1.html',
    { waitUntil: 'domcontentloaded' }
  )

  let count = 1
  let fileTitle = ''

  // weui-btn weui-btn_primary
  // weui-btn weui-btn_default weui-btn_disabled
  while (await page.$('.weui-btn_primary')) {
    const textContent = await page.evaluate(() => {
      const title = document.querySelector('.chap-title > span')?.textContent
      const content = document.querySelector(
        '#inner_chap_content_1'
      )?.textContent

      return { title, content }
    })

    fileTitle = Math.floor(count / 50) + 1

    fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

    const link = await page.$('.weui-btn_primary')
    const newURL = await link?.evaluate((el) => el.getAttribute('href'))
    console.log(newURL)
    await page.goto(`https://truyenyy.vip${newURL}`, {
      waitUntil: 'domcontentloaded',
    })

    // await page.waitForNavigation()

    count++
  }

  await browser.close()
}

scrapeData()
//
