//Importando axios para fazer a requisição à API da Codenation e FS para criação do arquivo answer.json
const axios = require ('axios');
const fs = require('fs');
//Importando a answer obtida.
const answer = require('../answer.json');
//Importando crypto para obter o resumo_criptografico.
const crypto = require('crypto');
//Importando o Form-Data para obter o resultado em Form-Data.
const FormData = require('form-data');

//Assim que se obtém o answer.json com a mensagem encriptada, necessita-se decriptá-la, para isso usamos a array function:
const Decript = (string, shift) => {
    let decripted = '';
    //Verificando as letras separadamente pelo UNICODE.
    for(let i=0;i<string.length; i++){
        const letra = string[i].charCodeAt();
        //Restringindo apenas ao alfabeto em minúsculo.
        if(letra>=97 &&  letra <=122){
            const decif = (letra - 97 - shift) % 26;
            if(decif < 0){
                decripted += String.fromCharCode(123 + decif);
            } else {
                decripted += String.fromCharCode(decif + 97);
            }
        } else {
            decripted += String.fromCharCode(letra);
        }
    }
    return decripted;
};

//Fazendo a primeira requisição HTTP utilizando método GET para conseguir dados do arquivo.
axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=0e7f5575ffb407a9f7c8a5215c436db3e8b83783 ')
.then (res =>{
    const response = res.data;
    response.decifrado = Decript(response.cifrado, response.numero_casas);
    response.resumo_criptografico = crypto.createHash('sha1').update(response.decifrado).digest('hex');
    fs.writeFileSync('answer.json', JSON.stringify(response));
    //Verificando a resposta da minha primeira requisição.
    console.log(response);

}).then(async _ => {
    //Configurando arquivo como Form/Data
    const resconf = new FormData();
    resconf.append('answer', fs.createReadStream('answer.json'));
    //Realizando segunda requisição, agora no método HTTP POST.
    console.log("Post realizado com sucesso");
    const res = await axios.post('https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=0e7f5575ffb407a9f7c8a5215c436db3e8b83783 ',
    resconf,
    {headers: resconf.getHeaders()},
    );
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })


