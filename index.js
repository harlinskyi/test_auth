const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const moment = require('moment');

const url = 'https://www.imdb.com/';

const clickByXpath = async ({page,xpath}) => {
	const elmHandlers = await page.$x(xpath);
	if (elmHandlers.length > 0) {
		await elmHandlers[0].click();
	} else {
		throw new Error(`XPath elements not found: ${xpath}`);
	}
};

const logErrorAndExit = err => {
	console.log(err);
	process.exit();
};

function timeStamp(s) {
	mathFl = Math.floor(s / 1000);
	return moment.unix(mathFl).format("DD-MM-YYYY HH:mm:ss");
}

async function IMDb_Autorization(UserEmail, UserPassword) {
	// Initillization browser 
	let startTime = Date.now();
	const browser = await puppeteer.launch({
		headless: false
	});
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());
	await page.goto(url, {
		waitUntil: 'networkidle2'
	});
	// End

	// Start steps
	await page.screenshot({
		path: 'screenshots/open_page.png'
	});
	await page.waitForSelector('a[href*=signin]')
		.then(() => console.log(`[LOG][${timeStamp(Date.now())}] Wait element 'a[href*=signin]' button.`));
	await Promise.all([
		page.waitForNavigation(),
		page.click('a[href*=signin]')
	]);
	await page.waitForXPath('//*[contains(@class,"imdb-logo")]/..')
		.then(() => console.log(`[LOG][${timeStamp(Date.now())}] Wait element '//*[contains(@class,"imdb-logo")]/..'.`));
	await clickByXpath({
		page: page,
		xpath: '//*[contains(@class,"imdb-logo")]/..'
	});
	await page.waitForSelector('input#ap_email')
		.then(() => console.log(`[LOG][${timeStamp(Date.now())}] Wait element 'input#ap_email'.`));
	await page.waitForSelector('input#ap_password')
		.then(() => console.log(`[LOG][${timeStamp(Date.now())}] Wait element 'input#ap_password'.`));
	await page.type('input#ap_email', UserEmail);
	await page.type('input#ap_password', UserPassword);
	await Promise.all([
		page.waitForNavigation(),
		page.click('input#signInSubmit'),
	]);
	await page.waitForSelector('a.imdb-header-account-menu__sign-out')
		.then(() => console.log(`[LOG][${timeStamp(Date.now())}] Wait element 'input#ap_email'.`));
	await page.setRequestInterception(true);
	if (page.url() == (url + '?ref_=login')) {
    await page.screenshot({
			path: 'screenshots/authorization_success.png'
		});
		console.log(`[LOG][${timeStamp(Date.now())}] Authorization was successful.`);
	} else if (page.$$('div#image-captcha-section').length > 0) {
		await page.screenshot({
			path: 'screenshots/captcha_err.png'
		});
		console.log(`[LOG][${timeStamp(Date.now())}] Need type captcha. Show screenshots in logs.`);
	} else {
		await page.screenshot({
			path: 'screenshots/err.png'
		});
		console.log(`[LOG][${timeStamp(Date.now())}] Unknown error!`);
	};
	await browser.close();
	console.log(`[LOG][${timeStamp(Date.now())}] Time execution: `, (Date.now() - startTime) / 1000, `s.`);
};

IMDb_Autorization('someEmail', 'somePassword').catch(logErrorAndExit);