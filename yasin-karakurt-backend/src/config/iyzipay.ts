import Iyzipay from 'iyzipay';

// DEBUG LOGU: Terminalde ne yazdığına bakacağız
console.log("--- IYZICO CONFIG KONTROL ---");
console.log("API KEY BASLANGICI:", process.env.IYZICO_API_KEY?.substring(0, 12));
console.log("URI:", 'https://sandbox-api.iyzipay.com');
console.log("-----------------------------");

export const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY as string,
    secretKey: process.env.IYZICO_SECRET_KEY as string,
    uri: 'https://sandbox-api.iyzipay.com' 
});