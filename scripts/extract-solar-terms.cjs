const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '../backend/.env' });

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'saju_user',
    password: process.env.DB_PASSWORD,
    database: 'saju'
  });

  // 1900~2050년 절기 데이터 추출
  const [rows] = await connection.query(`
    SELECT solar_year, term_name, term_datetime
    FROM solar_terms
    WHERE solar_year BETWEEN 1900 AND 2050
    ORDER BY solar_year, term_datetime
  `);

  const solarTermsByYear = {};

  rows.forEach(row => {
    const year = row.solar_year;
    const date = new Date(row.term_datetime);

    if (!solarTermsByYear[year]) {
      solarTermsByYear[year] = [];
    }

    solarTermsByYear[year].push({
      name: row.term_name,
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes()
    });
  });

  // 각 연도에 24절기가 있는지 확인
  Object.keys(solarTermsByYear).forEach(year => {
    const count = solarTermsByYear[year].length;
    if (count !== 24) {
      console.log(`Warning: Year ${year} has ${count} terms (expected 24)`);
    }
  });

  fs.writeFileSync('/Users/toto/devel/myprojects/saju/manseryeok-js/raw-data/solar-terms-full.json', JSON.stringify(solarTermsByYear, null, 2));
  console.log('Extracted solar terms data');
  console.log('Years:', Object.keys(solarTermsByYear).sort((a,b)=>a-b).join(', '));
  console.log('Total records:', rows.length);

  await connection.end();
}

main().catch(console.error);
