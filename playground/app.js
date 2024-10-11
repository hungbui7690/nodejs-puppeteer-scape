const puppeteer = require('puppeteer')
const fs = require('fs')

const scrapeData = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(
    'https://truyenchuth.com/truyen-giai-tri-theo-nam-2004-bat-dau/chuong-1-tro-lai-nam-2004.html',
    { waitUntil: 'domcontentloaded' }
  )

  let count = 1
  let fileTitle = ''

  while (await page.$('#nextchap')) {
    const textContent = await page.evaluate(() => {
      const title = document.querySelector(
        'ul.w3-ul li:nth-child(3) h3'
      )?.textContent
      const content = document.querySelector('.chapter-content')?.textContent

      return { title, content }
    })

    fileTitle = Math.floor(count / 50) + 1

    fs.writeFileSync(`./${fileTitle}.txt`, textContent.title, { flag: 'a' })
    fs.writeFileSync(`./${fileTitle}.txt`, textContent.content, { flag: 'a' })

    const link = await page.$('#nextchap')
    const newURL = await link?.evaluate((el) => el.getAttribute('href'))
    console.log(newURL)
    await page.goto(newURL, { waitUntil: 'domcontentloaded' })

    count++
  }

  await browser.close()
}

scrapeData()
