import CryptoJS from "crypto-js";


const secretKey="fonndsroutier-daren"



export const chiffrement=(param)=>{

    const bytes=CryptoJS.AES.encrypt(param,secretKey).toString();
    return encodeURIComponent(bytes) ;
}

export const dechiffrement=(param)=>{

    try{

        param=decodeURIComponent(param)

        const byte=CryptoJS.AES.decrypt(param,secretKey)
        const decrypted=byte.toString(CryptoJS.enc.Utf8)

        return decrypted;

    }catch(e){
        console.log(e)
        return null
    }
}