function a (msg){
    const as =   ['Senin',
     '22',
     'Juni',
     '2026',
     '22/06/2026',
     'LINTAS',
     'BOO LINE',
     'A',
     '11:32',
     '1532',
     'CILEBUT',
     '205JR55',
     '205-55',
     '-',
     'ICA',
     'speedometer',
     'speedo error',
     'kecepatan error',
     'reset speedo',
     'DC Bogor',
     'CLOSE'
   ]
 

 let keyReport = [as].map(e => e[0]+e[5]+e[7]+e[14]+e[15])

 console.log(keyReport)
}

a('asda')