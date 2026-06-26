import {google} from 'googleapis'
import fs from 'fs'

export function pushToJSON(data) {
  //const formatted = {};
  // const newData = ['Format Laporan',
  // '#tanggal        : 11/06/2026.',
  // '#pukrl          : rk.',
  // '#ka                 : 1711d',
  // '#no ts            : 205jr 56',
  // '#no kereta      : 204-56',
  // '#temuan        :  baut sandaran patah',
  // '#tindak lanjut : borr dan diganti baut 8 mm',
  // '#kategori        : ica',
  // '#status            : close'
  // ]

  const newData = data
  
  fs.writeFileSync('tempData.json', JSON.stringify(newData, null, 2)); //! JSON.stringfy opt apa saja
  console.log("Data tersimpan ke tempData.json");
}

export function readTempJSON() {
  const raw = fs.readFileSync('tempData.json');
  const data = JSON.parse(raw);
  console.log(data)
  return data
}

export async function pushDataToGS() {
    try{
        const auth = new google.auth.GoogleAuth({
        keyFile: 'keys-db sarana dinas.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient()

        //Instance of google sheets API
        const googleSheets = google.sheets({version: 'v4', auth: client})
        const sheetName = 'kendala_lintas'
        
        const inputData = readTempJSON()
        console.log('inputData =>',inputData)
        const resp = await googleSheets.spreadsheets.values.append({spreadsheetId: '16VqRhs7oog5_b6PzVgvuRVPb-FSV7mGwmS0A0hx17_Y',
        range: sheetName,
        valueInputOption : 'RAW',
        insertDataOption : 'INSERT_ROWS',
        requestBody : {
            values  : inputData
        }
    })
            
            //saveToJSON(data)
            let responseSucces = 'Data berhasil diinput ! Terima kasih atas laporan yg anda berikan..'
            return responseSucces
        
    }catch(error){
        console.error(error)
        throw error
    }
}

export async function getDataFromGS() {
    try{
        const auth = new google.auth.GoogleAuth({
        keyFile: 'keys-db sarana dinas.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        const client = await auth.getClient()

        //Instance of google sheets API
        const googleSheets = google.sheets({version: 'v4', auth: client})
        const sheetName = ['data_ka','waktu_tempuh','sg','rekap_order','kendala_lintas','all_ctrq']
        
        const resp = await googleSheets.spreadsheets.values.batchGet({spreadsheetId: '16VqRhs7oog5_b6PzVgvuRVPb-FSV7mGwmS0A0hx17_Y',
            ranges: sheetName})
            //console.log(resp)
            const data = resp.data
            
            saveToJSON(data)
            
        
    }catch(error){
        console.error(error)
        throw error
    }
}

export function saveToJSON(data) {
  const formatted = {};
  data.valueRanges.forEach(range => {
    const sheetName = range.range.split("!")[0]
    formatted[sheetName] = range.values;
  });

  fs.writeFileSync('batchData.json', JSON.stringify(formatted, null, 2)); //! JSON.stringfy opt apa saja
  console.log("Data multi-sheet tersimpan ke batchData.json");
}

export function readJSON() {
  const raw = fs.readFileSync('batchData.json');
  const data = JSON.parse(raw);
  const sheetNames = Object.keys(data);

  console.log("Daftar sheet:", sheetNames);
  return data
}


//pushDataToGS()
