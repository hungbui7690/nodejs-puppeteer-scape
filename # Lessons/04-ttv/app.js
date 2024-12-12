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

  // https://truyen.tangthuvien.vn/doc-truyen/cai-nay-vua-man-anh-chi-muon-khao-chung-gia-ca-anh-de-chich-tuong-khao-chung
  // https://truyen.tangthuvien.vn/doc-truyen/tong-tieu-tinh-tau-huong-cu-tinh
  // https://truyen.tangthuvien.vn/doc-truyen/trong-sinh-chi-khu-cuoc-dai-han-bien-nam-than/chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/dai-man-hoa/chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/my-loi-kien-danh-loi-song-thu/chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/hollywood-chi-lo/chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/toi-giai-anh-tinh/3523872-chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/hollywood-che-tac/chuong-1
  // https://truyen.tangthuvien.vn/doc-truyen/bac-tuoc-hao-lai-o-1980-boc-lot-hollywood-1980/481279-chuong-1
  // 'https://truyen.tangthuvien.vn/doc-truyen/trung-sinh-tai-hollywood/chuong-1'

  const url =
    // 'https://truyen.tangthuvien.vn/doc-truyen/toi-giai-anh-tinh/chuong-263'
    'https://truyen.tangthuvien.vn/doc-truyen/tam-quoc-tieu-ba-vuong/chuong-1'
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  let count = url.slice(url.lastIndexOf('-') + 1)
  let fileTitle = ''

  await page.waitForNetworkIdle()

  while (await page.$('a.bot-next_chap.bot-control')) {
    try {
      await page.waitForNetworkIdle()
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
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      count++
    } catch (error) {
      logger.error(error)
      await page.reload()
    }
  }

  await browser.close()
}

scrapeData()
