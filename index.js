import qrcode from 'qrcode-terminal'
const {LocalAuth,Client} = pkgWA 
import pkgWA from 'whatsapp-web.js'
import { responseJawaban, responseInputData, submitDataLaporan } from './handlerMsg.js'
import * as gasProcess from './handlerGAS.js'
import cron from 'node-cron'


const client = new Client({
    authStrategy: new LocalAuth({ clientID: 'Bot-Ramsez'})
})

client.on('qr', qr => qrcode.generate(qr, { small: true}))
client.on('authenticated', () => console.log('QR Telah di scan...'))
client.on('ready', () => {
    console.log('WA Terkoneksi !')
    const idServer = '141497848611059@lid'
    cron.schedule("0 */2 * * *", () => {
        client.sendMessage(idServer,'Lapor.. Server Up !')
    })
})

//!Ambil data dari GAS
gasProcess.getDataFromGS()
//cron.schedule("0 */2 * * *", gasProcess.getDataFromGS(), { timezone: "Asia/Jakarta" });
cron.schedule("0 */2 * * *", () => {
    console.log("Cron job triggered at:", new Date().toISOString());
    try {
        gasProcess.getDataFromGS();
    } catch (error) {
        console.error("Error while running cron job:", error.message);
        // Optional: log stack trace for debugging
        //console.error(error.stack);
        // Optional: send alert (email, Slack, etc.)
    }
    }, {
  timezone: "Asia/Jakarta" // Adjust to your timezone
});

//! Bot sudah ready dan siap menerima pesan !!

client.on('message', async msg => {
    //console.log((await msg.getContact()).id.user)
        
    const msgg = msg.body.trim().toLowerCase()
    const allData = gasProcess.readJSON()
    console.log(msg.from)


    if(msgg.startsWith('help')){
    let firstMenu = 
    `Hallo, apakah ada yg bisa saya bantu?

    Kirim pesan berikut :
    Untuk mencari *KA* tertentu yang berdinas hari ini :
    */KA {No KA} =>*
    Contoh : /KA 1001
    *-------------*
    Untuk mencari *Loop* tertentu :
    */L. {No Loop} =>*
    Contoh : /L. 10
    *-------------*
    Untuk mencari *Trainset* tertentu :
    */TS {No Trainset} =>*
    Contoh : /TS 205JR33
                    
    *=============*

    Kirim pesan berikut :
    Apakah anda ingin mengetahui format input data ?
    Untuk Mengetahui penulisan format data gangguan =>
    *#f.gangguan*

    *=============*

    Kirim pesam berikut :
    Untuk mencari data riwayat sebuah trainset :
    (Filter berdasarkan Lintas, No Trainset, No Kereta, Tanggal, Kategori, Komponen, Crew TL, Status) 
    Format Penulisan =>
    Gunakan '/' untuk fungsi *atau*
    Gunakan '&' untuk fungsi *dan*
    Contoh :
    *?data*
    *205JR144/205JR141*
                    
    *?data*
    *205JR144&Juli&2026*`
                    
                    
        //firstMenu = firstMenu.join('\n*=============*\n')

    //let secondMenu = 'Apakah anda ingin input data ?\nKirim pesan berikut =>\n */inputdata*'
    
    
    let response = firstMenu
    //firstMenu.concat('\n\n*==========*\n',secondMenu)



    msg.reply(response)
    }

    else if(msgg.startsWith('!inputgangguan')){
        let response = responseInputData(msgg)
        //console.log(response)
        msg.reply(response)  

    }

    else if(msgg.startsWith('#f.gangguan')){
        const formatGangguan = 
        '!inputgangguan\n'+
        '#Tanggal_____:\n'+
        '#Klasifikasi_:\n'+
        '#Lintas_______:\n'+
        '#Kelas________:\n'+
        '#Jam__________:\n'+
        '#KA___________:\n'+
        '#Lokasi_______:\n'+
        '#No TS________:\n'+
        '#No Kereta____:\n'+
        '#No Dirjen____:\n'+
        '#Kategori_____:\n'+
        '#Komponen_____:\n'+
        '#Catatan______:\n'+
        '#Penyebab_____:\n'+
        '#Tindak Lanjut__:\n'+
        '#Crew TL______:\n'+
        '#Status_______:'

        const desc =
        '!inputgangguan\n'+
        'Perintah agar bot input laporan gangguan\n'+
        '*=============*\n'+
        '#Tanggal_____:\n'+
        'Tanggal harus berformat tanggal/bulan/tahun\n'+
        'Cth : 15/01/2026\n'+
        '*=============*\n'+
        '#Klasifikasi_:\n'+
        'Isi dengan keterangan dimana gangguan ditemukan\n'+
        'Lintas/DC/MC/PB MC\n'+
        '*=============*\n'+
        '#Lintas_______:\n'+
        'Isi dengan keterangan Lintas KA tsb\n'+
        'Cth: BOO LINE/CKR LINE/TPK LINE\n'+
        '*=============*\n'+
        '#Kelas________:\n'+
        'Isi dengan salah satu kelas berikut :\n'+
        'A : gangguan yg menggangu perka\n'+
        'B : gangguan yg dpt TL ON TRIP\n'+
        'C : gangguan yg dpt diTL saat PH/Bersiang\n'+
        '*=============*\n'+
        '#Jam__________:\n'+
        'Isi dengan keterangan Jam gangguan dilaporkan\n'+
        'Cth : 10:30\n'+
        '*=============*\n'+
        '#KA___________:\n'+
        'Isi dengan no KA saat terjadi Gangguan\n'+
        'Cth : 1001\n'+
        '*=============*\n'+
        '#Lokasi_______:\n'+
        'Isi dengan nama stasiun/lokasi gangguan dilaporkan\n'+
        'Cth : Cawang\n'+
        '*=============*\n'+
        '#No TS________:\n'+
        'Isi No Trainset\n'+
        'Cth : 205JR144\n'+
        '*=============*\n'+
        '#No Kereta____:\n'+
        'Isi dengan No kereta yg dilaporkan\n'+
        'Cth : 204-390\n'+
        '*=============*\n'+
        '#No Dirjen____:\n'+
        'Isi dengan No Dirjen Kereta\n'+
        'K1 1 10 120\n'+
        '*=============*\n'+
        '#Kategori_____:\n'+
        'Isi dengan salah satu kategori bagian yg mengalami gangguan\n'+
        'AC : Air Conditioner\n'+
        'BIE : Body, Interior, dan Eksterior\n'+
        'PNE : Pneumatic\n'+
        'BG : Bogie\n'+
        'PTR : Propulsi Traksi\n'+
        'ICA : Instrumen Kabin\n'+
        'ME : Main Elektrik\n'+
        'APS : Auxilarry Power Supply (MG/SIV)\n'+
        'LL : Lain-lain\n'+
        '*=============*\n'+
        '#Komponen_____:\n'+
        'Isi dengan nama komponen yg gangguan\n'+
        'Cth : Kompressor\n'+
        '*=============*\n'+
        '#Catatan______:\n'+
        'Isi dengan laporan awal gangguan\n'+
        '*=============*\n'+
        '#Penyebab_____:\n'+
        'Isi dengan penyebab gangguan\n'+
        '*=============*\n'+
        '#Tindak Lanjut:\n'+
        'Isi dengan tindak lanjut gangguan\n'+
        '*=============*\n'+
        '#Crew TL______:\n'+
        'Isi dengan Crew yg Tindak Lanjut\n'+
        'Cth : PUKRL SRP\n'+
        '*=============*\n'+
        '#Status_______:\n'+
        'Isi dengan status gangguan (CLOSE/OPEN)'


        client.sendMessage(msg.from,formatGangguan)
        setTimeout(() => {client.sendMessage(msg.from,desc)},Math.random()*3000)

    }
    else if((msg.hasQuotedMsg) && msgg.startsWith('!y')){
        const quotedMsg = await msg.getQuotedMessage()
        //console.log(quotedMsg.body)
        let response = ''
        try {
            const dataSubmit = submitDataLaporan(quotedMsg.body)
            if(allData.kendala_lintas.some(e => e[0] == dataSubmit[0][0])){
                response = 'Data sudah ada yg input (terdeteksi sebagai data duplikat), terima kasih'
            }
            else{
                const monit = await gasProcess.pushToJSON(dataSubmit)
                response = await gasProcess.pushDataToGS()
                await gasProcess.getDataFromGS()
                console.log(response)
                
            }
        } catch (error) {
                console.log(error)
                response = 'Proses input data gagal..'
        } 
        
        msg.reply(response)
        
    }
    else if(msgg.startsWith('/')){
        const jawaban = responseJawaban(allData,msgg)
        setTimeout(() => {msg.reply(jawaban)}, Math.random()*3000)
    }
    else {
        console.log('Informasi yg diberikan tidak sesuai..')
        }
  
})


client.initialize()

