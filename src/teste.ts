import bcrypt from "bcrypt"

async function testar(){
    const senhaDIgitada = "sara1234"
    const hash = await bcrypt.hash(senhaDIgitada, 10)
    console.log("Hash gerado:",hash)
    
    //testar com a senha correta
    const senhaCorreta = await bcrypt.compare("sara1234", hash)
    console.log("Senha correta bate?", senhaCorreta) //true

    //Testar com uma senha errada
    const senhaErrada = await bcrypt.compare("senhaErrada123", hash)
    console.log("Senha errada bate?", senhaErrada) // false
}

testar()