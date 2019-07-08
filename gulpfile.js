const gulp   = require('gulp');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const sass   = require("gulp-sass");

// require('require-dir')('./gulp');

gulp.task('js', function() {
    return gulp.src([
            "./node_modules/tablesort/dist/tablesort.min.js",
            "./node_modules/tablesort/dist/sorts/tablesort.number.min.js",
            "./node_modules/micromodal/dist/micromodal.min.js",
            "./src/script/**/*.js"
        ])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/site/assets/script'));
});

gulp.task('css', function() {
    return gulp
        .src("./src/style/*.scss")
        .pipe(sass({
            outputStyle: 'compressed'
        })
        .on('error', sass.logError))
        .pipe(gulp.dest('./src/site/assets/style'));
});

gulp.task("watch", function() {
    gulp.watch('./src/style/**/*.scss', gulp.parallel('css'));
    gulp.watch('./src/script/**/*.js', gulp.parallel('js'));
});

gulp.task('build', gulp.parallel(
    'css',
    'js'
));

gulp.task('dev', gulp.series(
    'build',
    'watch'
));

/* Image resizer

Removed from package.json:
- "gulp-image-resize": "^0.13.0",
- "concurrent-transform": "^1.0.0",

var os          = require("os");
var parallel    = require("concurrent-transform");
var imageResize = require('gulp-image-resize');

var resizeImageTasks = [];
[600].forEach(function(size) {
    var resizeImageTask = 'resize_' + size;
    gulp.task(resizeImageTask, function(done) {
        gulp.src('./src/site/assets/img/_weapon-character-iceborne/*')
            .pipe(parallel(
                imageResize({ width : size }),
                os.cpus().length
            ))
            .pipe(gulp.dest('./src/site/assets/img/weapon-character-iceborne/'))
        ;
        done();
    });
    resizeImageTasks.push(resizeImageTask);
});

gulp.task('images', gulp.parallel(resizeImageTasks, function copyOriginalImages(done) {
    gulp.src('./src/site/assets/img/_weapon-character-iceborne/*')
        .pipe(gulp.dest('./src/site/assets/img/weapon-character-iceborne/'));
    done();
}));
//*/

// --------------------------------------------------------------------------------
// Google API Communication
// --------------------------------------------------------------------------------
// TODO: REFACTOR!

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// These are publicly visible data:
const runnersSpreadsheetId = '1gkajCT_WfW_fSrQQgFOSF8_lRz_-t6CVVrNIWoPVVHc';
const runsSpreadsheetId    = '1eX6tEDpShySfk3FhjLnZEK0q8Ulbq8iVP8aSyUIjDuo';

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function importRunners(auth) {
    const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
        spreadsheetId: runnersSpreadsheetId,
        range: 'Runners!B2:K',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            let offset = 2;
            rows.map((row) => {
                // if (row[8] == undefined) { console.log('Approved is undefined'); }
                // if (row[9] == undefined) { console.log('Status is undefined'); }
                if (row[8] == 'OK' && row[9] == undefined) {
                    runnerToFile(row, offset);

                    const request = {
                        spreadsheetId: runnersSpreadsheetId,
                        range: `K${offset}:K${offset}`,
                        valueInputOption: 'RAW',
                        resource: {
                            range: `K${offset}:K${offset}`,
                            values: [
                                ['OK']
                            ]
                        },
                        auth: auth
                    };
                    sheets.spreadsheets.values.update(request, function(err, response) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        // console.log(JSON.stringify(response, null, 2));
                    });
                }
                offset++;
            });
        } else {
            console.log('No data found.');
        }
    });
}

let sheet = 'Runs';
// let sheet = '20190704-TSC';

function importRuns(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: runsSpreadsheetId,
        range: `${sheet}!B2:L`,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            let offset = 2;
            rows.map((row) => {
                // if (row[9]  == undefined) { console.log('Approved is undefined'); }
                // if (row[10] == undefined) { console.log('Status is undefined'); }
                if (row[9] == 'OK' && row[10] == undefined) {
                    runToFile(row, offset);

                    const request = {
                        spreadsheetId: runsSpreadsheetId,
                        range: `${sheet}!L${offset}:L${offset}`,
                        valueInputOption: 'RAW',
                        resource: {
                            range: `${sheet}!L${offset}:L${offset}`,
                            values: [
                                ['OK']
                            ]
                        },
                        auth: auth
                    };
                    sheets.spreadsheets.values.update(request, function(err, response) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        // console.log(JSON.stringify(response, null, 2));
                    });
                }
                offset++;
            });
        } else {
            console.log('No data found.');
        }
    });
}

function runnerToFile(row, offset) {
    let title   = row[0];
    let twitter = row[3];
    let youtube = row[2];
    let twitch  = row[1];
    let patreon = row[4];
    let other   = row[5];
    let country = row[6];
    let weapons = row[7];

    weapons = weapons.split(',');
    weapons = weapons.map(i => i.trim());
    weapons = '    - ' + weapons.join('\n    - ');

    result =
`---
title   : ${title}
twitter : ${twitter}
youtube : ${youtube}
twitch  : ${twitch}
patreon : ${patreon}
country : ${country}
weapons :
${weapons}
---
${other}
`
    // console.log(result);

    const path = `./src/site/runners/__import/${title}.md`;
    fs.writeFile(path, result, (err) => {
        if (err) return console.error(err);
        console.log('Written runner:', path);
    });
}

function runToFile(row, offset) {
    let video    = row[0];
    let quest    = row[1];
    let date     = row[2];
    let time     = row[3];
    let weapons  = row[4];
    let run_type = row[5];
    let platform = row[6];
    let patch    = row[7];
    let runners  = row[8];

    weapons = weapons.split(',');
    weapons = weapons.map(i => i.trim());

    weaponsForFilename = weapons.join('-');

    weaponsData = '    - ' + weapons.join('\n    - ');

    // This means runners with a comma in their names will be split up.
    // In the future, we'll probably add 3 extra columns.
    runners = runners.split(',');
    runners = runners.map(i => i.trim());
    runners = '    - ' + runners.join('\n    - ');

    result =
`---
title          :
video          : ${video}
run_type       : ${run_type}
platform       : ${platform}
patch_version  : ${patch}
date           : ${date}
time           : ${time}
quest          : ${quest}

runners:
${runners}

weapons:
${weaponsData}
---
`
    // console.log(result);

    const path = `./src/site/runs/__import/${date}--${weaponsForFilename}--${quest}--${offset}.md`;
    fs.writeFile(path, result, (err) => {
        if (err) return console.error(err);
        console.log('Written run: ', path);
    });
}

gulp.task('import-runners', function(){
// Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), importRunners);
    });
    return new Promise(function(resolve, reject) {
        console.log("OK");
        resolve();
    });
});

gulp.task('import-runs', function(){
// Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), importRuns);
    });
    return new Promise(function(resolve, reject) {
        console.log("OK");
        resolve();
    });
})
