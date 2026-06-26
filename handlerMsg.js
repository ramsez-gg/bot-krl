import { readJSON, pushToJSON, pushDataToGS } from "./handlerGAS.js";
const allData = readJSON()

function formatTextReply(rows,pemisah_1,pemisah_2) {
  // Hitung panjang maksimum tiap kolom
  let colWidths = [];
  rows.forEach(row => {
    row.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i] || 0, cell.length);
    });
  });

  // Format tiap baris dengan padding
  return rows.map(row => {
    return row.map((cell, i) => {
      return cell.padEnd(colWidths[i], " "); // tambahkan spasi sampai lebar maksimum
    }).join(pemisah_1); // pemisah antar kolom
  }).join(pemisah_2);
}

function numberToClockTime(num) {
  // num = total minutes
  let hours = Math.floor(num / 60) % 24; // wrap around 24h
  let minutes = num % 60;

  // pad with leading zero if needed
  let hh = String(hours).padStart(2, "0");
  let mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
}

function isValidTime(str) {
  const parts = str.split(":");

  // Must have exactly 2 parts
  if (parts.length !== 2) return false;

  const [hours, minutes] = parts.map(Number);

  // Check if both are numbers and within time ranges
  return (
    !isNaN(hours) &&
    !isNaN(minutes) &&
    hours >= 0 && hours <= 23 &&
    minutes >= 0 && minutes <= 59
  );
}

function parseTanggal (tanggal){
    const [day, month, year] = tanggal.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const formatTanggal = date.toLocaleDateString("id-ID",{
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"})
    //console.log(formatTanggal)
    const hari = formatTanggal.split(',')[0]
    const splitTanggal = formatTanggal.split(',')[1].trim().split(' ')
    splitTanggal.unshift(hari)
    console.log(splitTanggal)
    return splitTanggal
}
//*mengolah data hasil pertanyaan user
//const starQ = '/ts 205JR33'


//* handling pertanyaan user
function handlerLoop (allData,startQ){
    const keyMsg = startQ.substring(3).trim()
            //console.log('test')
            let data = allData.data_ka.filter(e => e[1].includes(keyMsg) && e[1].length == keyMsg.length)
            
            //* INFO TANGGAL
            const tanggal = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            
            //* INFO KA
            const noKA = data.map(e => [e[0],e[1],e[2],e[3],e[6],e[7]])
            
            //* INFO TRAINSET
            let ts = [...new Set(data.map(e => `Trainset______: ${e[13]}\nStanformasi__: SF ${e[14]}\nNo Rangkaian_: ${e[15]}\nDepo Induk___: ${e[16]}\nJenis Traksi_: ${e[17]}`))]
            ts = ts.join('\n-----\n')
            
            //* HEADER INFO KA
            const response_0 = ['KA', 'L.', 'Lintas', 'Relasi', 'JB', 'JT']
            
            //* COMPILE INFORMASI
            let response_final = ''
            if(noKA.length >= 1){
            noKA.unshift(response_0)
            const formattedKA = formatTextReply(noKA,"|","\n-----------------\n")
            response_final = tanggal.concat('\n',ts,'\n\n',formattedKA)
            }else{
                response_final = 'Maaf Loop yg anda cari tidak ada..\nBerikan Informasi Sesuai dengan format yg ditentukan !\n\nketik */format* \nuntuk mengetahui format yang disediakan ! '
            }

            console.log(response_final)
            return response_final
}

function handlerKA (allData,startQ){
     
            const keyMsg = String(startQ.substring(3).trim())
            console.log(keyMsg)
            //* INFO TANGGAL
            const tanggal = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

            let data = allData.data_ka.filter(e => e[0].toLowerCase().includes(keyMsg))
            console.log(data)
            let ts = [...new Set(data.map(e => `Trainset______: ${e[13]}\nStanformasi__: SF ${e[14]}\nNo Rangkaian_: ${e[15]}\nDepo Induk___: ${e[16]}\nJenis Traksi_: ${e[17]}`))]
            
            if(data.length > 1){
                const noKA = data.map(e => e[0])
                const response = `Kami menemukan beberapa KA berdasarkan kata pencarian anda..\n${noKA.join('\n')}\n\nsilahkan ketik ulang secara benar dan lengkap KA yg ingin anda cari!\nCONTOH : /KA ${noKA[0]}`
                console.log(response)
                return response
            }else if(data.length == 1){

            const filter_loop = allData.data_ka.filter(e => e[1] == data[0][1])
            const idxKA = filter_loop.map(e => e[0].toLowerCase()).findIndex(e => e.toLowerCase().includes(keyMsg))
            console.log(idxKA)
            let responseExKA = ''
               
                if( idxKA != 0){
                    let exKA = filter_loop[idxKA-1]
                    responseExKA = `----------\nEX KA : ${exKA[0]}\nRelasi : ${exKA[3]}\nProgram Jam Perjalanan :\n ${exKA[6]} - ${exKA[7]}`
                }

            let responseNextKA = ''
                
                if( idxKA+1 != filter_loop.length){
                    let nextKA = filter_loop[idxKA+1]
                    
                    responseNextKA = `----------\nKA SELANJUTNYA : ${nextKA[0]}\nRelasi : ${nextKA[3]}\nProgram Jam Perjalanan :\n ${nextKA[6]} - ${nextKA[7]}`
                    //console.log(responseNextKA)
                }
            
                const dataKA = data.flat()
                let response = `KA : ${dataKA[0]}\nLoop : ${dataKA[1]}\nLintas : ${dataKA[2]}\nRelasi : ${dataKA[3]}\nProgram Jam Perjalanan : ${dataKA[6]} - ${dataKA[7]}\n\n`
                
                let response_1 = allData.waktu_tempuh.map(e => [e[0],e[1],e[2],e[3],e[4]]).filter(e => (dataKA[2].toLowerCase() == e[0].toLowerCase() && (dataKA[10].toLowerCase() == e[1].toLowerCase() || e[1].toLowerCase() == '') )  )
                    const start = response_1.map(e => e[2].toLowerCase()).indexOf(dataKA[4].toLowerCase())
                    const end = response_1.map(e => e[2].toLowerCase()).indexOf(dataKA[5].toLowerCase())
                    let response_arr = ''
                    console.log(response_1)
                    console.log(dataKA[4],start,dataKA[5],end)
                    if(start>end){
                        const response_ = response_1.slice(end,start+1).reverse()
                        //console.log(response_,start,end)
                        let departTime = dataKA[6].split(':')
                        departTime = Number(departTime[0])*60 + Number(departTime[1])
                        const estTimeArr = [[response_[0][1],numberToClockTime(departTime)]]
                        let i = 1
                        while (i < response_.length){
                            let departTimeKA = Number(response_[i-1][4]) + departTime
                            //console.log(departTime)
                            departTime = departTimeKA
                            estTimeArr.push([response_[i][3], numberToClockTime(departTimeKA)])
                            i++
                        }
                        response_arr = formatTextReply(estTimeArr,' => ','\n')
                        //console.log(response_arr)
                    }else{
                        const response_ = response_1.slice(start,end+1)
                        let departTime = dataKA[6].split(':')
                        departTime = Number(departTime[0])*60 + Number(departTime[1])
                        const estTimeArr = []
                        let i = 0
                        while (i < response_.length){
                            let departTimeKA = Number(response_[i][4]) + departTime
                            //console.log(departTime)
                            departTime = departTimeKA
                            estTimeArr.push([response_[i][3], numberToClockTime(departTimeKA)])
                            i++
                        }
                        response_arr = formatTextReply(estTimeArr,' => ','\n')
                        
                    }
                response = tanggal.concat('\n',response,response_arr,'\n\n',ts,'\n\n',responseExKA,'\n',responseNextKA)
                console.log(response)
                return response
            }else{
                const response = 'Maaf *KA* yg anda cari tidak ada..\nBerikan Informasi Sesuai dengan format yg ditentukan !\n\nketik */format* \nuntuk mengetahui format yang disediakan ! '
                return response
            }   
}

function handlerTS (allData,startQ){
    
    const keyMsg = String(startQ.substring(3).trim().replace(' ','').replace('ts',''))
    
    //* INFO TANGGAL
    const tanggal = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    
    //* INFO DINAS TRAINSET
    const dinasKA = allData.data_ka.filter(e => e[13]?.toLowerCase() == keyMsg )
    let ts = [...new Set(dinasKA.map(e => `Trainset______: ${e[13]}\nStanformasi__: SF ${e[14]}\nNo Rangkaian_: ${e[15]}\nDepo Induk___: ${e[16]}\nJenis Traksi_: ${e[17]}\nDinas Loop : ${e[1]} (${e[2]})`))]
        ts = ts.join('\n============\n')
    //* INFO RIWAYAT
    // const data = allData.rekap_order.filter(e => e[4].toLowerCase() == keyMsg)
    // let dataRiwayat = [...new Set(data.map(e => `Tanggal : ${e[1]}\nTroubleshooter : ${e[2]}\nNo KA : ${e[3]}\nTrainset : ${e[4]}\nNo Kereta : ${e[5]} (${e[6]})\n\nLaporan :\n${e[7]}\n\nTindak Lanjut :\n${e[8]}\n\nKategori : ${e[9]}\nStatus : ${e[10]}`))]
    //     dataRiwayat = dataRiwayat.join('\n*===============*\n')

    //*INFO TRAINSET
    const sgKRL = allData.sg.filter(e => e[1] == keyMsg.toUpperCase()).sort((a,b) => a[3] - b[3])
    let stanformasi = [...new Set(sgKRL.map(e => `${e[4]}\n${e[5]}\n`))]
        stanformasi = stanformasi.join('\n------------\n')

    //* RESPONSE FINAl
    const response_final = 
    `###-${tanggal}-###\n`+
    `${ts}\n`+
    `\n###-SUSUNAN-###\n`+
    `${stanformasi}`

        console.log(response_final)
    return response_final

}

//! reply process

export function responseJawaban(allData,msg){
  
  const startQ = msg.toLowerCase()
  let response = ''
    try {
        if(startQ.includes('/l.')){
          response = handlerLoop(allData,startQ)
        }

        else if(startQ.includes('/ka')){
          response = handlerKA(allData,startQ)       
        }
        
        else if(startQ.includes('/ts')){
          response = handlerTS(allData,startQ)
        }
        else{
          response = 'Maaf *DATA* yg anda cari tidak ada..\nBerikan Informasi Sesuai dengan format yg ditentukan !\n\nketik => \n help \nuntuk mengetahui format yang disediakan ! '
        }
        
    } catch (error) {
        console.log(error)
        response = ('Bot Tidak dapat Memproses, silahkan hubungi +628129606446 untuk melaporkan hal ini.. Tks')
    }
    return response
}

//! Input laporan dll
export function responseInputData(msg){
  const startD = msg.toLowerCase()
  let response = ''
  try {
    if(startD.startsWith('!inputgangguan')){
      console.log(startD)
      response = handlerInputLaporan(startD)
    }

    else if(startD.startsWith('###-Formatted Report-###')){
      response = handlerSubmitDataLaporan(startD)

    }
    else{
      response = 'Data yg anda input tidak sesuai, silahkan lihat format laporan yang telah di tentukan !'
    }
    
  } catch (error) {
    console.log(error)
    response = 'Terjadi Error, Silahkan hubungi +6281296064446 untuk melaporkan hal ini !'
  }

  return response;
}

//test
// const str = '#Tanggal_____: 11/06/2026\n'+
//         '#Klasifikasi_: Lintas\n'+
//         '#Lintas_______: BOO LINE\n'+
//         '#Kelas________: B\n'+
//         '#Jam__________:10:30\n'+
//         '#KA___________:1104\n'+
//         '#Lokasi_______: \nTangerang\nbarat\n';

// handlerInputLaporan(str)


function handlerInputLaporan (msg){
  try { 
  // Gunakan regex untuk ambil semua nilai setelah ":" sampai sebelum baris berikutnya "#"
    const regex = /:[\s]*([\s\S]*?)(?=\n#|$)/g;
    let match;
    const laporanArr = [];

    while ((match = regex.exec(msg)) !== null) {
        laporanArr.push(match[1].trim());
    }
    let formatted = laporanArr.map((value,index) => formattingItem(index,value));
        //console.log(laporanArr)
  let headerReply = '###-Formatted Report-###'
  let footerReply = '*Apakah data yg akan diinput sudah sesuai? jika iya balas pesan ini dengan kata =>*\n*!Y*\n\n*Data berhasil diinput jika anda sudah menerima balasan..*\n(Data berhasil diinput ! Terima kasih atas laporan yg anda berikan..)'
  let confirmReport = 
        `#Tanggal_____:\n`+
        `#Klasifikasi_:\n`+
        `#Lintas_______:\n`+
        `#Kelas________:\n`+
        `#Jam__________:\n`+
        `#KA___________:\n`+
        `#Lokasi_______:\n`+
        `#No TS________:\n`+
        `#No Kereta____:\n`+
        `#No Dirjen____:\n`+
        `#Kategori_____:\n`+
        `#Komponen_____:\n`+
        `#Catatan______:\n`+
        `#Penyebab_____:\n`+
        `#Tindak Lanjut__:\n`+
        `#Crew TL______:\n`+
        `#Status_______:`
      confirmReport = confirmReport.split('\n').map((value,index) => `${value} ${formatted[index]}`)
      //console.log(confirm_)
      confirmReport = confirmReport.join('\n')

      confirmReport = `${headerReply}\n`+
      `\n!-!-!-!-!\n`+
      `${confirmReport}`+
      `\n!-!-!-!-!\n\n`+
      `${footerReply}`

  return confirmReport
  } catch (error) {
    console.log(error)
    return `Data yang anda input tidak sesuai format, *Semua kolom harus terisi!*
    berikan '-' untuk kolom yg tidak diketahui`
  } 
}

export function submitDataLaporan (msg){
  let msgSubmit = msg.split('!-!-!-!-!')
    msgSubmit = msgSubmit[1]
  console.log(msgSubmit);

  const regex = /:[\s]*([\s\S]*?)(?=\n#|$)/g;
    let match;
    let formatted = [];

    while ((match = regex.exec(msgSubmit)) !== null) {
        formatted.push(match[1].trim());
    }
    
    formatted = formatted.map((value,index) => formattingItem(index,value));
    
    let pecahTanggal = parseTanggal(formatted[0])
    let keyReport = [formatted].map(e => e[0]+'-'+e[5]+'-'+e[7]+'-'+e[8]+e[14]+e[15])
    
    //Menggabungkan item no kereta dan no dirjen..
    formatted.splice(8,2,formatted[8]+'/'+formatted[9])

    let final_arr = [[...keyReport,...pecahTanggal,...formatted]]
  return final_arr
}

function formattingItem(i,item){
  console.log(i,item,item.length)
  // Hari dan Tanggal
  if(i == 0){
    item = item.replace(/\.$/, "").toString()
    if(item.split('/').length === 3){
      item = item
    }
    else{
      item = '`format tanggal salah, Cth yg benar => 01/01/2026`'
    }
    }

  //Klasifikasi
  if(i == 1){
    if(/^(Lintas|DC|MC|PB)$/i.test(item)){
      item = item.toUpperCase()
    }
    else{
      item = '`Format Salah, Format yang sesuai => Lintas/DC/MC/PB`'
    }
  }

  //Lintas CL
  if(i == 2){
    if(/^(BOO LINE|RK LINE|TNG LINE|CKR LINE|BST LINE|TPK LINE|MERAK LINE)$/i.test(item))
      item = item.toUpperCase()
    
  else{
      item = '`Format Salah, Format yang Sesuai => (BOO LINE/RK LINE/TNG LINE/CKR LINE/BST LINE/TPK LINE)`'
  }
  }

  //Kelas
  if(i == 3){
    if(/^(A|B|C)$/i){
      item = item.toUpperCase()
    }
    else{
      item = '`Pilih kelas A/B/C =>\nA : untuk gangguan yang mengganggu perka\nB : TL ON Trip\nC : TL saat PH/Bersiang`'
    }
  }

  //JAM
  // if( i == 4){
  //   if(isValidTime(item)){
  //   }
  //   else{
  //     item = 'Sesuaikan Format Jam Cth => 10:30'
  //   }
  // }
  
  //KA
  if(i == 5){
    item = item.toUpperCase()
  }

  //Andil Kelambatan
  //Lokasi
  if( i == 6){
    item = item.toUpperCase()
  }

  //No TS
  if( i == 7){
    item = item.toUpperCase().replace(' ','').replace('TS','')
  }

  //No kereta + No dirjen
  if(i == 8){
    item = item.toUpperCase().replace(' ','').replace(',','-').replace('.','-')
  }
  
  //Depo Induk

  //Kategori
  if(i == 10){
    if(/^(AC|BIE|PNE|BG|PTR|ICA|ME|APS|LL)$/i){
      item = item.toUpperCase()
    }
    else{
      item = '`Sesuaikan Format => AC/BIE/PNE/BG/PTR/ICA/ME/APS/LL`'
    }
  }

  //Komponen
  //Catatan
  //Penyebab
  //Tindak Lanjut
  //Crew TL
  if(i == 15) {
    if(item.toLowerCase().startsWith('pukrl r')){
      item = 'PUKRL Rangkas Bitung'
    }
    else if(item.toLowerCase().startsWith('pukrl p')){
      item = 'PUKRL Parung Panjang'
    }
    else if(item.toLowerCase().startsWith('pukrl s')){
      item = 'PUKRL Serpong'
    }
    else if(item.toLowerCase().startsWith('pukrl tanah') || item.toLowerCase().startsWith('pukrl thb')){
      item = 'PUKRL Tanah Abang'
    }
    else if(item.toLowerCase().startsWith('pukrl m')){
      item = 'PUKRL Manggarai'
    }
    else if(item.toLowerCase().startsWith('pukrl tang') || item.toLowerCase().startsWith('pukrl tng')){
      item = 'PUKRL Tangerang'
    }
    else if(item.toLowerCase().startsWith('bas') || item.toLowerCase().startsWith('pukrl bst')){
      item = 'PUKRL Basoetta'
    }
    else if(item.toLowerCase().startsWith('pukrl j')){
      item = 'PUKRL Jakarta Kota'
    }
    else if(item.toLowerCase().startsWith('bek') || item.toLowerCase().startsWith('pukrl bks')){
      item = 'PUKRL Bekasi'
    }
    else if(item.toLowerCase().startsWith('ci') || item.toLowerCase().startsWith('pukrl ckr')){
      item = 'PUKRL Cikarang'
    }
    else if(item.toLowerCase().startsWith('dc bo') || item.toLowerCase().startsWith('bgr') || item.toLowerCase().startsWith('boo')){
      item = 'DC Bogor'
    }
    else if(item.toLowerCase().startsWith('dc d') || item.toLowerCase().startsWith('dp') || item.toLowerCase().startsWith('dpk')){
      item = 'DC Depok'
    }
    else if(item.toLowerCase().startsWith('dc bu') || item.toLowerCase().startsWith('bud')){
      item = 'DC Bukit Duri'
    }
    else if(item.toLowerCase().startsWith('dc m')){
      item = 'DC Manggarai'
    }
    else{
      item = 'Sesuaikan format => pukrl jakk / dc boo'
    }
  }


  if(i == 16) {
    item = item.toUpperCase()
  }

  return item
}

//! Pencarian Data Riwayat Trainset
//TEST


export function responseCariData(msg){
  const data = allData.all_ctrq
  return handlerCariData(data,msg)
}

function handlerCariData (allData,msg_0){
  const str = msg_0

  function parseFilterString(str) {
    const lines = str.trim().split("\n");
    const filters = {};

    lines.forEach(line => {
      // Hilangkan tanda # di depan
      const cleanLine = line.replace(/^#/, "").trim();
      // Pisahkan key dan value berdasarkan tanda :
      const [key, value] = cleanLine.split(":").map(s => s.trim());
      if (key && value) {
        filters[key] = value;
      }
    });

    return filters;
  }

  const scopeFilter = parseFilterString(str)
  console.log(scopeFilter)

  let responseStr = dynamicFilter(allData,scopeFilter).sort((a, b) => {
    // gabungkan kolom tanggal, bulan, tahun jadi string
    const dateA = new Date(`${a[2]} ${a[3]} ${a[4]}`);
    const dateB = new Date(`${b[2]} ${b[3]} ${b[4]}`);
    return dateB - dateA;
  }).slice(0,30);

  const responseLength = responseStr.length
      responseStr = responseStr.map(e => `Tanggal: ${e[1]},${e[2]}-${e[3]}-${e[4]}\n`+
        `Order: ${e[5]}\nTS: ${e[12]} (${e[13]})\nKategori: ${e[15]} - ${e[16]}\nIndikasi: ${e[18]}\nTL: ${e[19]}\nCrew TL: ${e[20]} - ${e[21]}\n`+
        (e[22] && e[22].trim() !== "" ? `TL Depo: ${e[22]}` : ""))
      
      responseStr = responseStr.join(`\n===============\n`)
 
        responseStr = `Berikut ${responseLength} data terakhir...\n${responseStr}`
        console.log(responseStr)
 return responseStr
}

function dynamicFilter(data, filterParams) {
  const header = data[0].map(e => e.toLowerCase()); // baris pertama = header
  const rows = data.slice(1); // sisanya = isi data

  return rows.filter(row => {
    let match = true;

    for (const key in filterParams) {
      const colIndex = header.indexOf(key.toLowerCase());
      if (colIndex !== -1) {
        const value = row[colIndex] ? row[colIndex].toString().toLowerCase() : "";
        const filterValue = filterParams[key].toString().toLowerCase();

        // hanya cek apakah value mengandung filterValue
        if (!value.includes(filterValue)) {
          match = false;
          break;
        }
      }
    }

    return match;
  });
}

// const test_msg = 
// `?data 
// #TS: 205JR144
// #Status: OPEN`


// handlerCariData(allData.all_ctrq,test_msg)



