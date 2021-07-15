/*
Projeto compilador simples de programas para Mips
Disciplina: Organização de computadores
Desenvolvido por Ismael Vianna
ver:1.2021-06-30
ver:1.2021-06-24
ver:1.2021-07-03
ver:1.2021-07-06
ver:1.2021-07-07
ver:1.2021-07-08
ver:1.2021-07-09
*/


//Registradores
const registradores_nomes = [
    "s0", 
    "s1", 
    "s2", 
    "s3", 
    "s4", 
    "s5", 
    "s6", 
    "s7"
];
const registradores_bin = [
    "00000", 
    "00001", 
    "00010", 
    "00011", 
    "00100", 
    "00101", 
    "00110", 
    "00111"
];

/*
Valores préfixados nos registradores:
s0 = 0
s1 = 1
s2 = 4
s3 = 0
s4 = 0
s5 = 0
s6 = 7
s7 = 9 - usado como retorno se erros
*/	

//Codigos de operacoes
const opcode_names = [
    "and", 
    "sw",
    "lw",
    "beq",
    "jmp",
    "halt",
    "add",
    "xor",
    "lws",
	"addi",
	"li",
	"bne",
	"stl",
	"sub",
	"move",
	"nand",
	"not",
	"nor",
	"or",
	"mult",
	"div",
	"rem",
	"sll",
	"srl",
	"bgt",
	"blt",
	"spati",
	"spat",
	"divf"
];

const opcode_bin = [
    "000001", 
    "000010",
    "000011",
    "000100",
    "000101",
    "000110",
    "000111",
    "001000",
    "001001",
	"001010",
	"001011",
	"001100",
	"001101",
	"001110",
	"001111",
	"010000",
	"010001",
	"010010",
	"010011",
	"010100",
	"010101",
	"010110",
	"010111",
	"011000",
	"011001",
	"011010",
	"011011",
	"011100",
	"011101"
];

/*
Identifica Linha de Instrucao - Registrador
Retorna registrador em binario? 5 bits
*/
function ConversorRegistrador(Reg){
    var reg_bin_return = "00000";
    for (var i = 0; i < registradores_nomes.length; i++) {
        if (registradores_nomes[i] == Reg) {
            reg_bin_return = registradores_bin[i];
        }
    }
    return reg_bin_return;
}

/*
Identifica Linha de Instrucao - Operacao
Retorna OpCode em binario? 6 bits
*/
function ConversorOpCode(OpCode){
    var opcode_bin_return = "000000";
    for (var i = 0; i < opcode_names.length; i++) {
        if (opcode_names[i] == OpCode) {
            opcode_bin_return = opcode_bin[i];
        }
    }
    return opcode_bin_return;
}

/* eh um opcode?*/
function EhOpCode(OpCode){
    var opcode_return = false;
    for (var i = 0; i < opcode_names.length; i++) {
        if (opcode_names[i] == OpCode) {
            opcode_return = true;
        }
    }
    return opcode_return;
}

/*
Identifica labels
*/
const labels_nomes = [];
const labels_enderecos = []; //9 bits cada. pula de 4 em 4 linhas
const linhas_bin = []; //linhas montadas em binario. Linhas de 32 bits

/*
Identifica label e armazena sua pos em binario ja atualizado com 9 bits
Um label e' identificado assim 'loop:' com dois pontos em seguida.
*/
function IdentificaLabel(linha, linha_pos){
    var labels_n = linha.split(":");
    if (labels_n.length == 2){
        labels_nomes[labels_nomes.length] = labels_n[0];
        labels_enderecos[labels_enderecos.length] = linha_pos * 4;
    }
}

/* eh label? obtem posicao da linha em decimal*/
// function EhLabel(label){
//     var label_return = -1;
//     for (var i = 0; i < labels_n.length; i++) {
//         if (labels_n[i] == label) {
//             label_return = i;
//         }
//     }
//     return label_return;
// }

function RetornaPosLabel(label){
    for(var i=0; i < labels_nomes.length; i++){
        if (labels_nomes[i] == label){
            return labels_enderecos[i];
        }
    }
    return 0;
}

/*
Convertendo para binario
num: numero a ser convertido
totalbits? total de bits de retorno
*/
function ConverteDecParaBin(num, totalbits){
    const number = parseInt(num);        
    var result = number.toString(2);

    for (var i=0; result.length < totalbits; i++){
        result = "0".concat(result);
    }
    return result;
}

function IdentificaLinhas(){
    var linhas = document.getElementById("txtbox_cod_assembly").value.split("\n");
    var palavra = [];
    var linha_bin = "";
    
    console.log("tam cod: " + linhas.length);

    //monta tabela de rotulos
    for (var i=0; i < linhas.length; i++){
        IdentificaLabel(linhas[i], i);        
    }

    var opcode = "";     //6 bits
    var rs = "";         //5 bits
    var rt = "";         //5 bits
    var rd = "";         //5 bits
    var funct = "";      //6 bits
    var imediato16 = ""; //16 bits
    var imediato12 = ""; //12 bits
    var address = "";    //9 bits
    var shamt = "00000"; //5 bits

    //le cada linha e decodifica
    for (var i=0; i < linhas.length; i++){
        //reconhecendo elementos da linha 
        palavra = linhas[i].split(":");

        //removendo a etiqueta, se houver
        if  (palavra.length == 2){
            palavra = palavra[1].split(" ");
        }else{
            palavra = palavra[0].split(" ");
        }

        //identificando opcode e registradores
        if (EhOpCode(palavra[0])){
            opcode = ConversorOpCode(palavra[0]);

            switch (palavra[0]) {
                case "add":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    add td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   		
				case "addi":
                    /*
                    opcode + rs + rt + imediato
                    addi rt rs imediato
                    */
                    if (palavra.length == 4){
						rt = ConversorRegistrador(palavra[1]);
                        rs = ConversorRegistrador(palavra[2]);
						
						imediato16 = palavra[3];
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "spat":
                    /*
					substui um bit da palavra de acordo com posição
                    opcode + rs + rt + td + imediato12
					spat reg_word position value
					rt  = reg_word_1
					rs  = reg_word_2
					position = rt[4 downto 0]. position < 32
					value = imediato12[0]. 1 bit (0 ou 1)
                    */
                    if (palavra.length == 4){                        
                        rs = ConversorRegistrador(palavra[1]);
                        rd = rs;
						rt = ConversorRegistrador(palavra[2]);
                        imediato12 = palavra[3];
                        imediato12 = ConverteDecParaBin(imediato12, 11);
						
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(imediato12))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "spati":
                    /*
					substui um bit da palavra de acordo com posição
                    opcode + rs + rt + imediato                    
					spat reg_word position value
					exemplo: spat s2 7 1
					rs  = reg_word
					rt  = rs
					position = imediato[4 downto 0]. position < 32
					value = imediato[5]. value = 1 bit(0 ou 1)
                    */
                    if (palavra.length == 4){                        
                        rs = ConversorRegistrador(palavra[1]);
                        rt = rs;
                        imediato16 = palavra[2];
                        imediato16 = ConverteDecParaBin(imediato16, 5);
						imediato16 = "0000000000".concat(palavra[3].concat(imediato16));
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "sll":
                    /*
                    opcode + rs + rt + imediato
                    sll rt rs imediato
                    */
                    if (palavra.length == 4){
						rt = ConversorRegistrador(palavra[1]);
                        rs = ConversorRegistrador(palavra[2]);
						
						imediato16 = palavra[3];
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 	
				case "srl":
                    /*
                    opcode + rs + rt + imediato
                    srl rt rs imediato
                    */
                    if (palavra.length == 4){
						rt = ConversorRegistrador(palavra[1]);
                        rs = ConversorRegistrador(palavra[2]);
						
						imediato16 = palavra[3];
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "rem":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    rem td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "mult":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    mult td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "div":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    div td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   		
				case "divf":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    divf td rs rt
					td recebe um valor float de 32 bits: inteiro[31:16], fracao[15:0]
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   		
				case "nand":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    nand td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "not":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    not td rs
                    */
                    if (palavra.length == 3){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = "00000";
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "nor":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    nor td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "or":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    or td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "move":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    move rt rs
                    */
                    if (palavra.length == 3){
                        rd = "0000000000";
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[1]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "sub":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    sub td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   		
                case "and":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    and td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
                case "xor":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    xor td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   
				case "stl":
                    /*
                    opcode + rs + rt + td + shamt + funct
                    stl td rs rt
                    */
                    if (palavra.length == 4){
                        rd = ConversorRegistrador(palavra[1]).concat(shamt);
                        rs = ConversorRegistrador(palavra[2]);
                        rt = ConversorRegistrador(palavra[3]);
                        funct = opcode;
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(funct))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;   
                case "sw":
                    /*
                    opcode + rs + rt + imediato16
                    sw rt (imediato16)rs
                    */
                    if (palavra.length == 3){
                        rt = ConversorRegistrador(palavra[1]);
                        imediato16 = palavra[2].split(")")[0];
                        imediato16 = imediato16.substring(1, imediato16.length);
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        rs = ConversorRegistrador(palavra[2].split(")")[1]);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
                case "lw":
                    /*
                    opcode + rs + rt + imediato16
                    lw rt (imediato16)rs
                    */
                    if (palavra.length == 3){
                        rt = ConversorRegistrador(palavra[1]);
                        imediato16 = palavra[2].split(")")[0];
                        imediato16 = imediato16.substring(1, imediato16.length);
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        rs = ConversorRegistrador(palavra[2].split(")")[1]);
                            
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "li":
                    /*
                    opcode + rs + rt + imediato16
                    lwi rt imediato16
                    */
                    if (palavra.length == 3){
                        rt = ConversorRegistrador(palavra[1]);
                        imediato16 = palavra[2];
                        imediato16 = ConverteDecParaBin(imediato16, 16);
                        rs = "00000"; //registrador zero, será sempre zero.
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
                case "lws":
                    /*
                    LOAD SOMA
                    opcode + rs + rt + td + imediato12
                    lws rd (imediato12)rs rt
                    */
                    if (palavra.length == 4){
                        rs = ConversorRegistrador(palavra[2].split(")")[1]);
                        rt = ConversorRegistrador(palavra[3]);
                        rd = ConversorRegistrador(palavra[1]);

                        imediato12 = palavra[2].split(")")[0];
                        imediato12 = imediato12.substring(1, imediato12.length);
                        imediato12 = ConverteDecParaBin(imediato12, 11);                        
                        
						console.log ("rs:" + rs);
						console.log ("rt:" + rt);
						console.log ("rd:" + rd);
						console.log ("imediato12:" + imediato12);
						
                        linha_bin = opcode.concat(rs.concat(rt.concat(rd.concat(imediato12))));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;          
                case "beq":
                    /*
                    BEQ - Branch If Equal
    	            opcode + rs + rt + imediato16
                    beq rs rt enderecoDoLabel
                    */
					//console.log("palavra.length=" + palavra.length);
                    if (palavra.length == 4){
                        rs = ConversorRegistrador(palavra[1]);
                        rt = ConversorRegistrador(palavra[2]);
                        imediato16 = ConverteDecParaBin(RetornaPosLabel(palavra[3]), 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                        console.log("linha_bin[beq]=" + linha_bin );
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;
				case "blt":
                    /*
                    BLT - Branch If Less Than
    	            opcode + rs + rt + imediato16
                    blt rs rt enderecoDoLabel
                    */
                    if (palavra.length == 4){
                        rs = ConversorRegistrador(palavra[1]);
                        rt = ConversorRegistrador(palavra[2]);
                        imediato16 = ConverteDecParaBin(RetornaPosLabel(palavra[3]), 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "bgt":
                    /*
                    BGT - Branch If Grater Than
    	            opcode + rs + rt + imediato16
                    bgt rs rt enderecoDoLabel
                    */
                    if (palavra.length == 4){
                        rs = ConversorRegistrador(palavra[1]);
                        rt = ConversorRegistrador(palavra[2]);
                        imediato16 = ConverteDecParaBin(RetornaPosLabel(palavra[3]), 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
				case "bne":
                    /*
                    BNE - Branch If Not Equal
    	            opcode + rs + rt + imediato16
                    bne rs rt enderecoDoLabel
                    */
					//console.log("palavra.length=" + palavra.length);
                    if (palavra.length == 4){
                        rs = ConversorRegistrador(palavra[1]);
                        rt = ConversorRegistrador(palavra[2]);
                        imediato16 = ConverteDecParaBin(RetornaPosLabel(palavra[3]), 16);
                        
                        linha_bin = opcode.concat(rs.concat(rt.concat(imediato16)));
                        console.log("linha_bin[beq]=" + linha_bin );
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break;  
                case "jmp":
                    /*
                    JUMP
                    opcode + 17 zeros + address
                    jmp enderecoDoLabel
                    */
                    if (palavra.length == 2){
                        address = ConverteDecParaBin(RetornaPosLabel(palavra[1]), 26);
                        linha_bin = opcode.concat(address);
                    }else{
                        //retorna o resto dos bits em zero? houve erro!                        
                        linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    }
                    break; 
                case "halt":
                    /*
                    HALT
                    opcode + 26 zeros
                    halt
                    */
                    linha_bin = opcode.concat(ConverteDecParaBin("0", 26));
                    break;                   
                default:
                  //retorna tudo zero
                  linha_bin = opcode.concat(ConverteDecParaBin("0", 32));
            }
            linhas_bin[linhas_bin.length] = linha_bin;        
		}
    }
}

/*
 Escreve o programa compilado na caixa de texto
*/
function EscreveCompilacao(){
    var txtbox_cod_binario = document.getElementById("txtbox_cod_binario");
    var texto = "";
    console.log("linhas_bin:" + linhas_bin.length);
    for (var i=0; i<linhas_bin.length; i++){
        texto = texto.concat(linhas_bin[i].concat("\n"));
    }
    
    txtbox_cod_binario.innerHTML = texto;
}

/*
 Escreve o programa compilado na caixa de texto
 segunda versao com opcao de copiar e colar na 
 memoria do mips
*/
function EscreveCompilacaoA(){
    var txtbox_cod_binario = document.getElementById("txtbox_cod_binario");
    var texto = "";
    console.log("EscreveCompilacaoA--linhas_bin:" + linhas_bin.length);
    for (var i=0; i<linhas_bin.length; i++){
        var a=i*4;
        var b=a+1;
        var c=a+2;
        var d=a+3;
        var inicioMemA = "                mem(".concat(a);
        var inicioMemB = "                mem(".concat(b);
        var inicioMemC = "                mem(".concat(c);
        var inicioMemD = "                mem(".concat(d);
        
		var espaco = ")";
		
		if (i < 10){
			espaco = ")    ";
		}			
		
		inicioMemA = inicioMemA.concat(espaco);
		inicioMemB = inicioMemB.concat(espaco);
		inicioMemC = inicioMemC.concat(espaco);
		inicioMemD = inicioMemD.concat(espaco);
		
        console.log(linhas_bin[i]);
        texto = texto.concat(inicioMemA.concat("<= \"".concat(linhas_bin[i].substring(0,8).concat("\";\n"))));
        texto = texto.concat(inicioMemB.concat("<= \"".concat(linhas_bin[i].substring(8,16).concat("\";\n"))));
        texto = texto.concat(inicioMemC.concat("<= \"".concat(linhas_bin[i].substring(16,24).concat("\";\n"))));
        texto = texto.concat(inicioMemD.concat("<= \"".concat(linhas_bin[i].substring(24,32).concat("\";\n"))));
 
        //texto = texto.concat(linhas_bin[i].concat("\n"));
    }
    
    txtbox_cod_binario.innerHTML = texto;
}

function Compilar(){
    //alert("Deseja compilar?");
    IdentificaLinhas();
    //EscreveCompilacao();
    EscreveCompilacaoA();
}

function ReloadFields(){
	window.location.reload(false); 
	/*
    var container = document.getElementById("txtbox_cod_binario");
    var content = container.innerHTML;
    container.innerHTML= ""; 
    
	container = document.getElementById("txtbox_cod_assembly");
    content = container.innerHTML;
    container.innerHTML= ""; 
	  */
    console.log("Refreshed"); 
}

       